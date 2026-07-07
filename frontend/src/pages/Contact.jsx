import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { supportAPI } from "../services/api";

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Form submitted");

  try {
    setLoading(true);
    setError("");

    console.log("Sending request...");

    const response = await supportAPI.createTicket({
      name,
      email,
      subject,
      message,
    });

    console.log("SUCCESS:", response);

    setSubmitted(true);

    setName("");
    setEmail("");
    setSubject("");
    setMessage("");

  } catch (err) {
    console.error("ERROR:", err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Failed to submit your support request."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Contact Customer Support
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Need help registering as a doctor or troubleshooting consultation links? Drop us a query.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Information</h2>
          <div className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <span>100 Health Avenue, Suite 500, Medical City, MC 90210</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>+1 (555) 234-5678</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>support@auratelemed.com</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-150/40 dark:border-indigo-900/30 text-xs">
            <h4 className="font-bold text-indigo-650 dark:text-indigo-400 mb-1 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Aura Chatbot</span>
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              For instant queries regarding portal booking setups or platform analytics, click on the **Aura Assistant** floating icon in the bottom-right corner!
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass border border-slate-200/50 dark:border-slate-800/30 shadow-md space-y-4">
            {error && (

<div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs border border-rose-200">

{error}

</div>

)}
            {submitted && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 rounded-2xl text-xs border border-emerald-200/30 font-medium">
                Thank you! Your inquiry was submitted. A support representative will respond shortly.
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
    Subject
  </label>

  <input
    type="text"
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    placeholder="Payment Issue"
    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 focus:outline-none focus:border-indigo-500"
    required
  />
</div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Inquiry</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our administration assist you?"
                className="w-full h-28 px-3.5 py-2.5 border border-slate-200 dark:border-slate-805 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-indigo-600/10"
            >
              <Send className="w-4 h-4" />
              <span>

{loading ? "Submitting..." : "Send Query"}

</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
