"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type ScanResult =
  | { ok: true; code: string; eventName?: string }
  | { ok: false; reason: string; code?: string };

export function ScanClient() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [camError, setCamError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  async function validate(code: string) {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (data.ok) {
        setResult({
          ok: true,
          code: data.ticket.code,
          eventName: data.event?.name,
        });
      } else {
        setResult({
          ok: false,
          reason: data.reason,
          code: data.ticket?.code,
        });
      }
    } catch (e) {
      setResult({
        ok: false,
        reason: e instanceof Error ? e.message : "error",
      });
    } finally {
      setBusy(false);
    }
  }

  function extractCode(raw: string) {
    const match = raw.match(/entrada\/([A-Za-z0-9]+)/i);
    return (match?.[1] || raw).trim();
  }

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setUnlocked(true);
  }

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    let raf = 0;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
        if (!Detector) {
          setCamError("Este navegador no soporta escaneo automático. Usá el código manual.");
          return;
        }
        const detector = new Detector({ formats: ["qr_code"] });

        const tick = async () => {
          if (cancelled || !videoRef.current || scanningRef.current) {
            raf = requestAnimationFrame(tick);
            return;
          }
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              scanningRef.current = true;
              await validate(extractCode(codes[0].rawValue));
              setTimeout(() => {
                scanningRef.current = false;
              }, 2500);
            }
          } catch {
            /* keep scanning */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setCamError("No se pudo abrir la cámara. Usá el ingreso manual.");
      }
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, pin]);

  if (!unlocked) {
    return (
      <div className="ticket-page">
        <form className="checkout-form" onSubmit={onUnlock}>
          <p className="section-label">Puerta</p>
          <h1 className="section-title">Validar entradas</h1>
          <label>
            PIN staff
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="ticket-page scan-page">
      <header className="ticket-topbar">
        <strong>Scanner puerta</strong>
        <Link href="/admin">Ventas</Link>
      </header>

      <div className="scan-video-wrap">
        <video ref={videoRef} muted playsInline className="scan-video" />
      </div>
      {camError ? <p className="form-note">{camError}</p> : null}

      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault();
          validate(extractCode(manualCode));
        }}
      >
        <label>
          Código manual
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Pegá o tipeá el código"
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Validando…" : "Validar"}
        </button>
      </form>

      {result ? (
        <div className={`scan-result ${result.ok ? "ok" : "bad"}`}>
          {result.ok ? (
            <>
              <strong>VÁLIDA</strong>
              <p>{result.eventName}</p>
              <p>{result.code}</p>
            </>
          ) : (
            <>
              <strong>
                {result.reason === "already_used"
                  ? "YA USADA"
                  : result.reason === "not_found"
                    ? "NO EXISTE"
                    : "ERROR"}
              </strong>
              {result.code ? <p>{result.code}</p> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
