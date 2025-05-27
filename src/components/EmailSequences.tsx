import React from 'react';
import { ArrowLeft, ArrowRight, Bold, Italic, Link, List, Undo2, RotateCw } from 'lucide-react';
import Button from './Button';

const EmailSequences: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden order-2 lg:order-1">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-600">to:</span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value="kayla.victoria@gmail.com"
                        readOnly
                        className="bg-transparent w-full focus:outline-none text-gray-800"
                      />
                    </div>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-600 rounded-full">
                      <span className="text-white text-xs">✓</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                  <Italic className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                  <List className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                  <Link className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-gray-800">
                <p>Hi Kayla,</p>
                <p>
                  I'm David from TalGPT. Your profile stood out to me as a strong fit for our open software engineering role.{' '}
                  <span className="bg-purple-100">Your experience building search APIs on Apache Lucene aligns closely with a major project we're kicking off here at TalGPT.</span>
                </p>
                <p>Are you interested in finding some time to speak?</p>
                <p>Best,<br />David</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">Send email</span>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  ⚡ Regenerate Email
                </button>
              </div>
            </div>
          </div>

          <div className="text-left order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Engage with AI-powered<br />email sequences
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Found the perfect fit? Increase response rates with smart outreach. TalGPT personalizes your email template while retaining your tone and voice.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                Try for free
              </Button>
              <Button variant="outline" size="lg">
                Request a demo →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailSequences;