import React from "react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Terms of Service
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Last updated: August 10, 2025
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                1. Acceptance of Terms
              </h3>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using AlgoBoard, you agree to be bound by these
                Terms of Service and all applicable laws and regulations. If you
                do not agree with any of these terms, you are prohibited from
                using this service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                2. Competitive Programming Handle Sharing
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                By using AlgoBoard, you explicitly agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>
                  Share your competitive programming handles (usernames) from
                  platforms including but not limited to Codeforces, AtCoder,
                  CodeChef, and LeetCode
                </li>
                <li>
                  Allow AlgoBoard to fetch and display your public profile
                  information, contest history, and submission data from these
                  platforms
                </li>
                <li>
                  Understand that this data will be used to provide analytics,
                  progress tracking, and comparison features
                </li>
                <li>
                  Acknowledge that only publicly available information from your
                  CP profiles will be accessed
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                3. Data Usage and Privacy
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                We collect and use your data to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide personalized dashboards and analytics</li>
                <li>
                  Track your progress across multiple competitive programming
                  platforms
                </li>
                <li>
                  Enable comparison features with other users (when you opt-in)
                </li>
                <li>
                  Send notifications about upcoming contests and achievements
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                4. Account Security and Accuracy
              </h3>
              <p className="text-gray-300 leading-relaxed">
                You are responsible for providing accurate competitive
                programming handles and maintaining the security of your
                AlgoBoard account. You must notify us immediately of any
                unauthorized access to your account.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                5. Prohibited Activities
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>
                  Provide false or misleading competitive programming handles
                </li>
                <li>
                  Attempt to manipulate or falsify your competitive programming
                  statistics
                </li>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                6. Issue Reporting and Contact
              </h3>
              <p className="text-gray-300 leading-relaxed">
                If you encounter any problems, bugs, security vulnerabilities,
                or have concerns about the service, we encourage you to reach
                out to the platform owner immediately. We are committed to
                addressing issues promptly and maintaining a secure environment
                for all users.
              </p>
              <p className="text-gray-300 leading-relaxed mt-3">
                <strong>Contact Information:</strong> For any issues or
                concerns, please contact us through the support channels
                provided in the application or reach out to the platform
                administrator.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                7. Service Availability
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We strive to maintain service availability but cannot guarantee
                uninterrupted access. The service may be temporarily unavailable
                due to maintenance, updates, or technical issues with external
                competitive programming platforms.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                8. Limitation of Liability
              </h3>
              <p className="text-gray-300 leading-relaxed">
                AlgoBoard is provided "as is" without any warranties. We are not
                liable for any data loss, inaccuracies in competitive
                programming statistics, or any damages resulting from the use of
                this service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                9. Changes to Terms
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Users
                will be notified of significant changes, and continued use of
                the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                10. Termination
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account if you violate these
                terms. You may also delete your account at any time, which will
                remove your data from our systems.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              I Accept - Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
