import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Privacy Policy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Last updated: August 10, 2025
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                1. Information We Collect
              </h3>

              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Personal Information
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mb-4">
                <li>Email address for account creation and communication</li>
                <li>Full name for personalized experience</li>
                <li>Username/handle for the AlgoBoard platform</li>
                <li>Student status (if applicable) for educational features</li>
              </ul>

              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Competitive Programming Data
              </h4>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>
                  <strong>Codeforces Handle:</strong> Username, rating, contest
                  history, problem-solving statistics
                </li>
                <li>
                  <strong>AtCoder Handle:</strong> Username, rating, contest
                  participation, performance data
                </li>
                <li>
                  <strong>CodeChef Handle:</strong> Username, rating, contest
                  history, submission statistics
                </li>
                <li>
                  <strong>LeetCode Handle:</strong> Username, problem-solving
                  progress, contest performance
                </li>
                <li>
                  All publicly available data from these platforms including
                  submissions, rankings, and achievements
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                2. How We Use Your Information
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Your competitive programming handles and associated data are
                used to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>
                  Create comprehensive dashboards showing your progress across
                  all platforms
                </li>
                <li>
                  Generate analytics and insights about your competitive
                  programming journey
                </li>
                <li>
                  Provide performance comparisons with friends and peers (with
                  your consent)
                </li>
                <li>
                  Send notifications about upcoming contests on your connected
                  platforms
                </li>
                <li>
                  Track your improvement over time and suggest areas for growth
                </li>
                <li>
                  Enable social features like leaderboards and friendly
                  competitions
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                3. Data Sharing and Consent
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>By using AlgoBoard, you explicitly consent to:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>
                  Sharing your competitive programming handles with our platform
                  for data aggregation
                </li>
                <li>
                  Allowing us to fetch publicly available information from
                  Codeforces, AtCoder, CodeChef, and LeetCode
                </li>
                <li>
                  Displaying your progress and statistics within the AlgoBoard
                  interface
                </li>
                <li>
                  Enabling comparison features with other users when you choose
                  to participate
                </li>
              </ul>

              <p className="text-gray-300 leading-relaxed mt-4">
                <strong>We do NOT:</strong> Access private information, modify
                your accounts on external platforms, or share your personal
                details without explicit permission.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                4. Data Security
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your
                personal information and competitive programming data. However,
                no method of transmission over the internet is 100% secure. We
                continuously work to improve our security practices and will
                notify users promptly if any security incidents occur.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                5. Third-Party Platforms
              </h3>
              <p className="text-gray-300 leading-relaxed">
                AlgoBoard integrates with external competitive programming
                platforms. We are not responsible for the privacy practices of
                these third-party services. We recommend reviewing their privacy
                policies:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4 mt-2">
                <li>Codeforces Privacy Policy</li>
                <li>AtCoder Terms and Privacy Policy</li>
                <li>CodeChef Privacy Policy</li>
                <li>LeetCode Privacy Policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                6. Issue Reporting and Data Concerns
              </h3>
              <p className="text-gray-300 leading-relaxed">
                If you discover any issues with data accuracy, security
                vulnerabilities, or have concerns about how your information is
                being used, please contact the platform owner immediately. We
                are committed to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
                <li>Responding to security concerns within 24 hours</li>
                <li>
                  Investigating and resolving data accuracy issues promptly
                </li>
                <li>
                  Providing transparency about any data breaches or issues
                </li>
                <li>Working with users to address their privacy concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                7. Your Rights
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Access all data we have collected about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of certain data collection features</li>
                <li>Withdraw consent for data sharing at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                8. Data Retention
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We retain your data for as long as your account is active or as
                needed to provide services. When you delete your account, we
                will remove your personal information and competitive
                programming handles from our systems within 30 days, except
                where required by law.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                9. Changes to Privacy Policy
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We may update this privacy policy periodically. We will notify
                users of any material changes via email or platform
                notifications. Continued use of the service after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                10. Contact Information
              </h3>
              <p className="text-gray-300 leading-relaxed">
                For any privacy-related questions, concerns, or to exercise your
                rights, please contact the AlgoBoard team through the support
                channels provided in the application or reach out directly to
                the platform administrator.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              I Understand - Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
