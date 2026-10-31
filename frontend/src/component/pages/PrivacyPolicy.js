import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
            onClick={() => navigate("/terms")}
            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          >
            Terms of Service
          </button>
        </div>

        <header className="mb-8 border-b border-neutral-700 pb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-3 text-neutral-400">
            Effective date: October 31, 2026. Last updated: October 31, 2026.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
            This Privacy Policy explains how AlgoBoard ("AlgoBoard," "we," "us,"
            or "our") collects, uses, shares, and protects personal information
            when you use our website, dashboards, analytics, and related
            services (collectively, the "Service"). It also describes the choices
            available to you regarding your information.
          </p>
        </header>

        <div className="space-y-10 rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-neutral-300 shadow-xl sm:p-9">
          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">1. Scope and controller</h2>
            <p className="leading-7">
              This Policy applies to information processed through the Service.
              AlgoBoard is responsible for the personal information described
              here. The Service is intended for users who are at least 13 years
              old. If you are below the age of majority where you live, you
              should use the Service only with the involvement of a parent or
              legal guardian.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">2. Information we collect</h2>
            <h3 className="mb-2 mt-5 text-lg font-medium text-blue-400">Information you provide</h3>
            <ul className="list-disc space-y-2 pl-6 leading-7">
              <li><strong className="text-white">Account details:</strong> your email address, first name, last name, and password. Your email address is your primary account identifier, and your password is stored only as a cryptographic hash.</li>
              <li><strong className="text-white">Connected platform handles:</strong> the Codeforces, AtCoder, CodeChef, and LeetCode handles you choose to connect.</li>
              <li><strong className="text-white">Account communications:</strong> information you provide when contacting support or exercising your privacy rights.</li>
            </ul>

            <h3 className="mb-2 mt-5 text-lg font-medium text-blue-400">Information collected automatically</h3>
            <ul className="list-disc space-y-2 pl-6 leading-7">
              <li>Technical information such as IP address, browser type, device type, operating system, and referring page.</li>
              <li>Usage information such as pages viewed, features used, authentication events, and error logs.</li>
              <li>Authentication tokens and account preferences stored in your browser's local storage or cookies, which are necessary to keep you signed in and secure the Service.</li>
            </ul>

            <h3 className="mb-2 mt-5 text-lg font-medium text-blue-400">Information from connected platforms</h3>
            <p className="leading-7">
              When you connect a competitive programming handle, we retrieve
              publicly available profile and performance data associated with
              that handle, such as ratings, ranks, contest participation,
              submission statistics, and contest history. We do not collect your
              passwords for those platforms, and we do not access private
              account information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">3. How we use information</h2>
            <p className="leading-7">We use personal information to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li>Create and maintain your account, authenticate you, and provide sign-in and account management.</li>
              <li>Retrieve and display your connected competitive programming profiles and statistics.</li>
              <li>Provide dashboards, analytics, progress tracking, and comparison features.</li>
              <li>Monitor, troubleshoot, secure, and improve the Service.</li>
              <li>Comply with legal obligations, enforce our Terms, and protect the rights and safety of AlgoBoard, users, and third parties.</li>
            </ul>
            <p className="mt-3 leading-7">
              Where applicable law requires a legal basis, we rely on performance
              of a contract with you, our legitimate interests in operating and
              securing the Service, your consent, and compliance with legal
              obligations.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">4. Cookies and local storage</h2>
            <p className="leading-7">
              We use cookies and browser local storage to operate the Service.
              These technologies may store your authentication token and basic
              account information so that you remain signed in and do not need
              to re-enter your credentials on every page. We do not currently
              use advertising cookies or sell data obtained through cookies.
              Most browsers allow you to manage or delete cookies and local
              storage, but disabling essential storage may prevent you from
              signing in or using parts of the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">5. Sharing and disclosure</h2>
            <p className="leading-7">
              We do not sell your personal information. We may share information
              in the following circumstances:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-7">
              <li><strong className="text-white">Service providers:</strong> hosting, database, email delivery, monitoring, and security providers that process information on our behalf under appropriate confidentiality obligations.</li>
              <li><strong className="text-white">Connected platforms:</strong> when you connect a handle, we retrieve public data from the relevant platform. Those platforms process information under their own privacy policies.</li>
              <li><strong className="text-white">Other users:</strong> your name, account email, connected handles, and aggregated statistics may be displayed on your AlgoBoard profile to other signed-in users.</li>
              <li><strong className="text-white">Legal and safety:</strong> when we believe disclosure is required by law, valid legal process, or necessary to protect rights, safety, security, or the integrity of the Service.</li>
              <li><strong className="text-white">Business transfers:</strong> in connection with a merger, acquisition, financing, reorganization, or sale of assets, subject to appropriate confidentiality protections.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">6. Data retention</h2>
            <p className="leading-7">
              We retain personal information for as long as your account remains
              active and as reasonably necessary to provide the Service, comply
              with legal obligations, resolve disputes, and enforce agreements.
              If you delete your account, we will remove your account information
              from active systems within 30 days, except where we are required to
              retain it by law or where it is necessary for security or fraud
              prevention. Residual copies may remain in backups for a limited
              period before being overwritten in the ordinary course.
            </p>
            <p className="mt-3 leading-7">
              We may retain aggregated or de-identified information that cannot
              reasonably be used to identify you.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">7. Security</h2>
            <p className="leading-7">
              We use administrative, technical, and organizational safeguards
              designed to protect personal information, including password
              hashing, access controls, and encrypted connections where
              supported. No method of transmission or storage is completely
              secure, and we cannot guarantee absolute security. You are
              responsible for keeping your password confidential and for promptly
              notifying us of suspected unauthorized activity.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">8. Your rights and choices</h2>
            <p className="leading-7">
              Depending on your location, you may have the right to access,
              correct, delete, or restrict the processing of your personal
              information; to object to certain processing; to request
              portability; and to withdraw consent where processing is based on
              consent. You can review and update your name and connected handles
              in Account Settings, and you can delete your account there.
            </p>
            <p className="mt-3 leading-7">
              To exercise a privacy right or ask a question, contact us at{" "}
              <a
                href="mailto:privacy@algoboard.app"
                className="font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                privacy@algoboard.app
              </a>
              . We may need to verify your identity before fulfilling a request.
              You may also have the right to lodge a complaint with your local
              data protection authority.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">9. Children's privacy</h2>
            <p className="leading-7">
              The Service is not directed to children under 13, and we do not
              knowingly collect personal information from children under 13. If
              we learn that we have collected information from a child under 13,
              we will take reasonable steps to delete it. If you believe a child
              under 13 has provided us with personal information, please contact
              us.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">10. International transfers</h2>
            <p className="leading-7">
              AlgoBoard and its service providers may process information in
              countries other than the one where you live. Those countries may
              have different data protection laws. Where required, we use
              appropriate safeguards for international transfers, such as
              contractual protections, and we take steps to protect information
              in accordance with this Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">11. Third-party links and platforms</h2>
            <p className="leading-7">
              The Service links to and retrieves data from third-party
              competitive programming platforms. We are not responsible for their
              content, security, or privacy practices. We encourage you to review
              the privacy policies of any third-party service you use, including
              Codeforces, AtCoder, CodeChef, and LeetCode.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">12. Changes to this Policy</h2>
            <p className="leading-7">
              We may update this Privacy Policy from time to time. If we make
              material changes, we will provide reasonable notice, such as by
              email or a prominent notice on the Service, and update the
              effective date above. Your continued use of the Service after the
              updated Policy takes effect means you acknowledge the updated
              Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold text-white">13. Contact us</h2>
            <p className="leading-7">
              For privacy questions, requests, or concerns, contact AlgoBoard at{" "}
              <a
                href="mailto:privacy@algoboard.app"
                className="font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                privacy@algoboard.app
              </a>
              . General support inquiries can be sent to{" "}
              <a
                href="mailto:support@algoboard.app"
                className="font-medium text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                support@algoboard.app
              </a>
              .
            </p>
          </section>

          <div className="flex flex-col gap-3 border-t border-neutral-700 pt-6 sm:flex-row sm:justify-between">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              I Understand — Back to Sign Up
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="rounded-lg border border-neutral-600 px-5 py-3 font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              Read Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
