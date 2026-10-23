"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { CITY_OPTIONS, todayIST, whatsappLink } from "../../lib/booking/types";
import { WhatsAppIcon } from "./WhatsAppFab";

const OCCASIONS = ["Bridal", "Engagement", "Party / function", "Family & bridesmaids", "Other"];

export default function EnquiryForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [date, setDate] = useState("");
  const [city, setCity] = useState("Jodhpur");
  const [occasion, setOccasion] = useState("Bridal");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const base = whatsappLink(whatsappNumber);
  const nameError = nameTouched && !name.trim() ? "Please enter your name." : "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setNameTouched(true);
      document.getElementById("enq-name")?.focus();
      return;
    }
    const lines = [
      `Hi Prachi, I'm ${name.trim()}.`,
      `Occasion: ${occasion}`,
      date ? `Event date: ${date}` : null,
      `City: ${city}`,
      message.trim() ? `\n${message.trim()}` : null,
    ].filter(Boolean);
    const href = whatsappLink(whatsappNumber, lines.join("\n"));
    if (!href) {
      setError("WhatsApp is not available right now. Please call or email us instead.");
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  if (!base) {
    return <p className="alert-info mt-6">Online enquiries are unavailable right now. Please call or email us.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <label htmlFor="enq-name" className="field-label">
          Your name
        </label>
        <input
          id="enq-name"
          className={`field ${nameError ? "field-invalid" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setNameTouched(true)}
          maxLength={80}
          autoComplete="name"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "enq-name-error" : undefined}
        />
        {nameError && (
          <p id="enq-name-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {nameError}
          </p>
        )}
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="field-label">Occasion</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Occasion">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={occasion === o}
              onClick={() => setOccasion(o)}
              className={`chip ${occasion === o ? "chip-active" : ""}`}
            >
              {o}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="enq-date" className="field-label">
          Event date <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="enq-date" type="date" min={todayIST()} className="field" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="enq-city" className="field-label">
          City
        </label>
        <select id="enq-city" className="field" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITY_OPTIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="enq-msg" className="field-label">
          Message <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="enq-msg"
          rows={4}
          className="field"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={800}
          placeholder="Outfit colours, number of functions, questions…"
        />
      </div>
      {error && <p className="alert-error sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary w-full px-7 sm:w-auto">
          <WhatsAppIcon className="h-4 w-4" /> Continue on WhatsApp
        </button>
      </div>
    </form>
  );
}
