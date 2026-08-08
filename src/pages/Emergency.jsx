import React, { useEffect, useRef, useState } from "react";
import { Siren, Download, MapPin, Plus, Trash2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "../Components/Toast";

const KEY = "healthlock_emergency";

function readData() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? JSON.parse(raw)
      : { bloodGroup: "", allergies: "", contacts: [] };
  } catch {
    return { bloodGroup: "", allergies: "", contacts: [] };
  }
}

function writeData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export default function Emergency() {
  const showToast = useToast();
  const qrRef = useRef(null);
  const [data, setData] = useState(readData());
  const [contactForm, setContactForm] = useState({ name: "", phone: "" });
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [locationLink, setLocationLink] = useState(null);

  useEffect(() => {
    writeData(data);
  }, [data]);

  const qrValue = JSON.stringify({
    bloodGroup: data.bloodGroup,
    allergies: data.allergies,
    contacts: data.contacts,
  });

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "emergency-qr-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleAddContact = () => {
    if (!contactForm.name.trim() || !/^\d{10}$/.test(contactForm.phone.trim())) {
      showToast("Enter a name and valid 10-digit phone number", "error");
      return;
    }
    setData((d) => ({ ...d, contacts: [...d.contacts, contactForm] }));
    setContactForm({ name: "", phone: "" });
    setContactModalOpen(false);
    showToast("Emergency contact added", "success");
  };

  const handleRemoveContact = (idx) => {
    setData((d) => ({ ...d, contacts: d.contacts.filter((_, i) => i !== idx) }));
  };

  const handleFindHospitals = () => {
    if (!navigator.geolocation) {
      showToast("Location is not supported in this browser", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps/search/hospitals/@${latitude},${longitude},14z`;
        setLocationLink(url);
        window.open(url, "_blank", "noopener,noreferrer");
      },
      () => {
        showToast("Could not access your location. Please allow location permission.", "error");
      }
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <Siren size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Emergency</h1>
        </div>

        {/* SOS button + nearby hospitals */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={handleFindHospitals}
            className="flex flex-col items-center justify-center gap-2 py-8 rounded-3xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg transition-colors"
          >
            <Siren size={32} />
            SOS — Find Nearby Hospitals
          </button>
          <div className="border border-gray-200 rounded-3xl p-6 flex flex-col justify-center">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MapPin size={16} /> Uses your device location to open nearby hospitals in Google Maps.
            </p>
          </div>
        </div>

        {/* Blood group + allergies */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
            <select
              value={data.bloodGroup}
              onChange={(e) => setData((d) => ({ ...d, bloodGroup: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Allergies</label>
            <input
              type="text"
              value={data.allergies}
              onChange={(e) => setData((d) => ({ ...d, allergies: e.target.value }))}
              placeholder="e.g. Penicillin, Peanuts"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Emergency Contacts</p>
            <button
              onClick={() => setContactModalOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {data.contacts.length === 0 ? (
            <p className="text-sm text-gray-400">No emergency contacts added yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.contacts.map((c, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-sm text-gray-800">{c.name} — {c.phone}</span>
                  <button onClick={() => handleRemoveContact(i)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Emergency QR card */}
        <div className="border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center">
          <p className="font-semibold text-gray-900 mb-4">Emergency QR Card</p>
          <div ref={qrRef} className="bg-white p-3 rounded-xl border border-gray-200">
            <QRCodeCanvas value={qrValue} size={160} />
          </div>
          <p className="text-xs text-gray-400 mt-3 max-w-xs">
            Contains your blood group, allergies, and emergency contacts — scan to share with first responders.
          </p>
          <button
            onClick={handleDownloadQr}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
          >
            <Download size={14} /> Download / Print QR Card
          </button>
        </div>
      </div>

      {contactModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Emergency Contact</h2>
              <button onClick={() => setContactModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Contact name"
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="tel"
                placeholder="10-digit phone number"
                value={contactForm.phone}
                onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
