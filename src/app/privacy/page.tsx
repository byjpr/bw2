export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            This Privacy Policy explains how we collect, use, process, and disclose your information, 
            including personal information, in conjunction with your access to and use of the platform.
          </p>
          <p>
            By using the platform, you acknowledge that you have read and understood this Privacy Policy 
            and our Terms of Service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mb-2">2.1 Information You Provide to Us</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>Account Information: When you register, we collect your name, email address, and password.</li>
            <li>Profile Information: Location data, social media handles, and responses to application questions.</li>
            <li>Communications: Messages you send to association admins or other platform members.</li>
            <li>Event Information: Your RSVPs, check-ins, and event participation data.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">2.2 Information We Automatically Collect</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>Usage Information: How you use the platform, pages viewed, and features accessed.</li>
            <li>Log Data: IP address, browser type, operating system, and referral source.</li>
            <li>Cookies: We use cookies and similar technologies to enhance your experience.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>To provide and maintain the platform and its services.</li>
            <li>To verify your identity and process applications.</li>
            <li>To connect you with relevant associations based on your location.</li>
            <li>To manage event RSVPs and check-ins.</li>
            <li>To communicate with you about the platform, services, and updates.</li>
            <li>To respond to your requests, questions, and feedback.</li>
            <li>To ensure the security and integrity of the platform.</li>
            <li>To enforce our Terms of Service and other policies.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
          <h3 className="text-xl font-semibold mb-2">4.1 Association Admins</h3>
          <p>
            Association admins will have access to your profile information, applications, RSVPs, and event attendance data 
            for members of their association.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">4.2 Platform Admins</h3>
          <p>
            Platform administrators have access to your information for the purposes of platform management, 
            moderation, and ensuring compliance with our policies.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required to do so by law or in response to valid requests by public authorities.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide you services, 
            comply with our legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>Under the GDPR and similar regulations, you have the following rights:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Right to access your personal data.</li>
            <li>Right to rectify inaccurate personal data.</li>
            <li>Right to erasure of your personal data.</li>
            <li>Right to restrict processing of your personal data.</li>
            <li>Right to data portability.</li>
            <li>Right to object to processing of your personal data.</li>
          </ul>
          <p>
            To exercise these rights, please contact us through the platform's settings or feedback mechanism.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the platform's feedback mechanism.
          </p>
        </section>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>Last Updated: June 27, 2025</p>
      </div>
    </div>
  );
}