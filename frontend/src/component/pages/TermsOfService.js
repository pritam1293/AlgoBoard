import React from "react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center text-sm font-medium text-neutral-400 transition hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign up
          </button>
          <button
            onClick={() => navigate("/privacy")}
            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          >
            Privacy Policy
          </button>
        </div>

        <header className="mb-8 border-b border-neutral-700 pb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mt-3 text-neutral-400">
            Effective date: October 31, 2026. Last updated: October 31, 2026.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
            These Terms of Service ("Terms") govern your access to and use of
            AlgoBoard, including its website, dashboards, analytics, and related
            services (collectively, the "Service"). By creating an account or
            using the Service, you agree to these Terms. If you do not agree,
            please do not use AlgoBoard.
          </p>
        </header>

        <div className="space-y-10 rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-neutral-300 shadow-xl sm:p-9">
          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">1. Eligibility and accounts</h2>
            <p className="leading-7">
              You must be at least 13 years old to use AlgoBoard. If you are
              under the age of majority where you live, you may use the Service
              only with the involvement of a parent or legal guardian.
            </p>
            <p className="mt-3 leading-7">
              You must provide accurate, current, and complete information when
              registering, including your first name, last name, and a valid
              email address. Your email address is the primary identifier for
              your account and is used for sign-in, account recovery, and
              service notices. You are responsible for maintaining the
              confidentiality of your password and for all activity that occurs
              under your account. Notify us promptly if you believe your account
              has been compromised.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">2. The AlgoBoard service</h2>
            <p className="leading-7">
              AlgoBoard aggregates publicly available competitive programming
              information from third-party platforms such as Codeforces, AtCoder,
              CodeChef, and LeetCode. The Service may display ratings, contest
              history, submission statistics, rankings, and other profile data,
              and may provide analytics, comparison, and progress-tracking
              features.
            </p>
            <p className="mt-3 leading-7">
              AlgoBoard is an independent service. We are not affiliated with,
              endorsed by, or sponsored by any competitive programming platform
              unless expressly stated. Third-party platforms may change their
              APIs, data, or terms at any time, and AlgoBoard does not guarantee
              that third-party data will always be available or accurate.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">3. Connected platform accounts</h2>
            <p className="leading-7">
              When you connect a competitive programming account, you authorize
              AlgoBoard to retrieve and display publicly available information
              associated with that handle. You confirm that you are entitled to
              use the handles you connect and that doing so does not violate the
              terms of the relevant platform.
            </p>
            <p className="mt-3 leading-7">
              We do not request or store passwords for third-party platforms. We
              do not modify your accounts on those platforms. Your use of each
              third-party platform remains subject to that platform's own terms
              and privacy policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">4. Acceptable use</h2>
            <p className="leading-7">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Provide false information or connect a handle you are not authorized to use.</li>
              <li>Impersonate another person or misrepresent your affiliation with any person or organization.</li>
              <li>Attempt to access another user's account, data, or private information without authorization.</li>
              <li>Interfere with the operation, security, or integrity of the Service or its infrastructure.</li>
              <li>Use automated means to scrape, overload, or circumvent rate limits or access controls.</li>
              <li>Reverse engineer, copy, or resell the Service except as permitted by applicable law.</li>
              <li>Use the Service for unlawful, fraudulent, harassing, or abusive purposes.</li>
            </ul>
            <p className="mt-3 leading-7">
              We may suspend or terminate access to the Service if we reasonably
              believe you have violated these Terms or created risk for AlgoBoard,
              other users, or third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">5. Your content and profile information</h2>
            <p className="leading-7">
              You retain ownership of the information you submit to AlgoBoard.
              You grant us a limited, non-exclusive license to host, process,
              display, and transmit that information as necessary to operate and
              improve the Service. This includes displaying your name, account
              email, connected handles, and aggregated statistics on your
              AlgoBoard profile to other signed-in users.
            </p>
            <p className="mt-3 leading-7">
              You are responsible for the information you choose to share. Do
              not submit content that infringes another person's rights, violates
              law, or contains sensitive information you do not want displayed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">6. Privacy</h2>
            <p className="leading-7">
              Our collection and use of personal information is described in our{" "}
              <button
                onClick={() => navigate("/privacy")}
                className="font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                Privacy Policy
              </button>
              , which is incorporated into these Terms. By using the Service, you
              acknowledge that you have read the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">7. Termination and account deletion</h2>
            <p className="leading-7">
              You may stop using the Service at any time and may delete your
              account from Account Settings. Upon deletion, we will remove your
              account and associated personal information from active systems,
              subject to the retention practices described in the Privacy Policy.
              Some information may remain in backups for a limited period or as
              required by law.
            </p>
            <p className="mt-3 leading-7">
              We may suspend or terminate your access if you violate these Terms,
              if required by law, or if continuing to provide the Service would
              create a security or operational risk. Where appropriate, we will
              provide notice of termination.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">8. Intellectual property</h2>
            <p className="leading-7">
              The Service, including its software, design, text, graphics, logos,
              and analytics, is owned by AlgoBoard or its licensors and is
              protected by applicable intellectual property laws. Except for the
              limited right to use the Service in accordance with these Terms, no
              rights are granted to you. Third-party trademarks and platform names
              belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">9. Disclaimers</h2>
            <p className="leading-7">
              The Service is provided on an "as is" and "as available" basis. To
              the maximum extent permitted by law, AlgoBoard disclaims all
              warranties, express or implied, including warranties of
              merchantability, fitness for a particular purpose,
              non-infringement, and accuracy. We do not guarantee that the
              Service will be uninterrupted, secure, or error-free, or that
              third-party data will be accurate, complete, or current.
            </p>
            <p className="mt-3 leading-7">
              AlgoBoard is not a competitive programming platform and does not
              control ratings, rankings, contest results, or other data
              maintained by third parties. Always verify important information
              with the relevant platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">10. Limitation of liability</h2>
            <p className="leading-7">
              To the maximum extent permitted by law, AlgoBoard and its
              officers, directors, employees, and agents will not be liable for
              any indirect, incidental, special, consequential, exemplary, or
              punitive damages, or for any loss of profits, data, goodwill, or
              opportunity, arising out of or relating to your use of the Service.
              Our total liability for any claim arising from the Service will not
              exceed the greater of the amount you paid to AlgoBoard in the
              twelve months before the claim or one hundred U.S. dollars (USD
              $100).
            </p>
            <p className="mt-3 leading-7">
              Some jurisdictions do not allow certain limitations, so some of the
              above may not apply to you.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">11. Indemnification</h2>
            <p className="leading-7">
              You agree to indemnify and hold harmless AlgoBoard and its
              officers, directors, employees, and agents from any claims,
              liabilities, damages, losses, and expenses, including reasonable
              legal fees, arising out of your use of the Service, your connected
              accounts, or your violation of these Terms or applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">12. Changes to the Service and Terms</h2>
            <p className="leading-7">
              We may modify, suspend, or discontinue any part of the Service. We
              may also update these Terms from time to time. If we make material
              changes, we will provide reasonable notice, such as by email or a
              prominent notice on the Service. Updated Terms become effective on
              the date stated at the top of this page. Your continued use of the
              Service after that date constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">13. Governing law and disputes</h2>
            <p className="leading-7">
              These Terms are governed by the laws of the jurisdiction in which
              AlgoBoard operates, without regard to conflict-of-law principles.
              Before filing a formal claim, you agree to contact us and attempt
              to resolve the dispute informally. Any dispute that cannot be
              resolved informally will be subject to the exclusive jurisdiction
              of the competent courts in that jurisdiction, unless applicable law
              requires otherwise.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">14. Contact</h2>
            <p className="leading-7">
              Questions about these Terms should be sent to{" "}
              <a
                href="mailto:support@algoboard.app"
                className="font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                support@algoboard.app
              </a>
              . We will make reasonable efforts to respond to legitimate
              inquiries.
            </p>
          </section>

          <div className="flex flex-col gap-3 border-t border-neutral-700 pt-6 sm:flex-row sm:justify-between">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              I Accept — Back to Sign Up
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="rounded-lg border border-neutral-600 px-5 py-3 font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              Read Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
