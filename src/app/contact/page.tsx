"use client";

import { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "",
    timeSlot: "",
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status.message]);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatTimeSlot = (timeSlot: string) => {
    const slots = {
      morning: "Matin (8h-12h)",
      afternoon: "Après-midi (14h-17h)",
      evening: "Fin de journée (17h-19h)"
    };
    return slots[timeSlot as keyof typeof slots] || timeSlot;
  };

  const formatDateForEmail = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.startsWith('33')) {
      return `+${numbers}`;
    }

    if (numbers.startsWith('0')) {
      return `+33${numbers.substring(1)}`;
    }

    return `+${numbers}`;
  };

  const isValidPhoneNumber = (phone: string) => {
    const regex = /^\+33[1-9][0-9]{8}$/;
    return regex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'phone') {
      const formattedPhone = formatPhoneNumber(e.target.value);
      setFormData(prev => ({
        ...prev,
        phone: formattedPhone
      }));

      if (formattedPhone && !isValidPhoneNumber(formattedPhone)) {
        setStatus({
          type: 'error',
          message: 'Numéro de téléphone invalide (format: +33XXXXXXXXX)'
        });
      } else {
        setStatus({ type: null, message: '' });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const cleanedData = {
        ...formData,
        phone: formData.phone.replace(/\s/g, ''),
        dateCreation: new Date().toISOString(),
        status: "nouveau",
        source: "site_web"
      };

      await addDoc(collection(db, "rendez-vous"), cleanedData);

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_ADMIN!,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          date: formatDateForEmail(formData.date),
          time_slot: formatTimeSlot(formData.timeSlot),
          message: formData.message,
          to_email: 'support@javachrist.fr'
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_CLIENT!,
        {
          to_name: formData.name,
          to_email: formData.email,
          client_name: formData.name,
          appointment_date: formatDateForEmail(formData.date),
          time_slot: formatTimeSlot(formData.timeSlot),
          from_name: "Plombier Chauffagiste",
          reply_to: 'support@javachrist.fr'
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      setStatus({
        type: "success",
        message: `Demande envoyée avec succès ! Un email de confirmation a été envoyé à ${formData.email}.`
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        message: "",
        timeSlot: ""
      });
    } catch (error) {
      console.error("Erreur:", error);
      setStatus({
        type: "error",
        message: "Une erreur est survenue. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrgentConfirmation = (confirmed: boolean) => {
    setShowUrgentModal(false);
    if (confirmed && pendingSubmission) {
      submitForm();
    }
    setPendingSubmission(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const today = new Date();
    const selectedDate = new Date(formData.date);
    const daysDifference = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference <= 2) {
      setShowUrgentModal(true);
      setPendingSubmission(true);
      return;
    }

    await submitForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">Prendre un rendez-vous</h1>
        <p className="text-center text-gray-600 mb-8">
          Remplissez le formulaire ci-dessous pour demander une intervention
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                autoComplete="name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="jean.dupont@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">Téléphone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                aria-invalid={status.type === 'error'}
                aria-describedby="phone-error"
                pattern="^\+33[1-9][0-9]{8}$"
                autoComplete="tel"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+33612345678"
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: +33 pour la France suivi du numéro sans le 0
              </p>
              {status.type === 'error' && (
                <p id="phone-error" className="text-red-500 text-sm mt-1">
                  {status.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-gray-700 mb-2">Date souhaitée *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={getCurrentDate()}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="timeSlot" className="block text-gray-700 mb-2">Créneau horaire souhaité *</label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un créneau</option>
                <option value="morning">Matin (8h-12h)</option>
                <option value="afternoon">Après-midi (14h-17h)</option>
                <option value="evening">Fin de journée (17h-19h)</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-700 mb-2">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Décrivez votre besoin..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-300
              ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Envoi en cours...
              </span>
            ) : "Envoyer la demande"}
          </button>
        </form>

        {status.message && (
          <div
            role="alert"
            aria-live="polite"
            className={`mt-4 p-4 rounded-lg transition-all duration-500 ease-in-out transform
              ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
              ${status.message ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          >
            {status.message}
          </div>
        )}

        {showUrgentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-blue-600 text-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Rendez-vous urgent</h3>
              <p className="mb-6">
                Vous demandez un rendez-vous dans moins de 48h. Pour les urgences, nous vous recommandons de nous appeler directement. Voulez-vous quand même envoyer la demande ?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleUrgentConfirmation(false)}
                  className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUrgentConfirmation(true)}
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}