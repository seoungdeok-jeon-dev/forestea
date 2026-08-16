import type { Metadata } from "next";
import {
  LegalDocument,
  LegalSection,
  LegalSubheading,
  LegalTable,
} from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy — Forestea",
  description:
    "How Forestea collects, uses, discloses, and otherwise processes personal data for online ordering, accounts, and our Clover integration.",
};

const EFFECTIVE_DATE = "August 15, 2026";

const CCPA_ROWS = [
  ["Identifiers", "Yes", "Yes"],
  ["Online Identifiers", "Yes", "Yes"],
  ["Protected Classification Characteristics", "No", "No"],
  ["Commercial Information", "Yes", "Yes"],
  ["Biometric Information", "No", "No"],
  ["Internet or Network Information", "Yes", "Yes"],
  ["Geolocation Data", "No", "No"],
  ["Sensory Information", "No", "No"],
  ["Professional or Employment Information", "No", "No"],
  ["Education Information", "No", "No"],
  ["Inferences", "No", "No"],
  ["Financial Information", "Yes (limited)", "Yes"],
  ["Medical Information", "No", "No"],
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      effectiveDate={EFFECTIVE_DATE}
    >
      <LegalSection title="1. Introduction">
        <p>
          This &quot;Privacy Policy&quot; explains how Forestea
          (&quot;Forestea,&quot; &quot;Company,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses, and
          otherwise processes personal data in connection with our café website
          at{" "}
          <a
            className="underline hover:text-ink"
            href="https://www.foresteacafe.com"
          >
            https://www.foresteacafe.com
          </a>{" "}
          and our application, the Forestea Integration App, which connects that
          website to the Clover Point of Sale system (&quot;Clover POS&quot;)
          (together, the &quot;Services&quot;). This Privacy Policy does not
          apply to our privacy practices in any other context.
        </p>
        <p>
          Our processing of personal data in connection with the Forestea
          Integration App is governed by this Privacy Policy and our agreements
          with the merchant that installed the application (any, a
          &quot;Merchant&quot;). In the event of any conflict between this
          Privacy Policy and a Merchant agreement, the Merchant agreement will
          control to the extent permitted by applicable law.
        </p>
        <p>
          This Privacy Policy is not a substitute for any privacy policy that a
          Merchant may be required to provide to their customers, personnel, or
          other individuals.
        </p>
      </LegalSection>

      <LegalSection title="2. Our two roles">
        <p>
          Forestea acts in two distinct roles, and it is important to understand
          which one applies to you:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">
              Service provider / processor for a Merchant.
            </strong>{" "}
            When we read Clover inventory and create Clover orders and payments
            through the Forestea Integration App, we process Merchant data on
            behalf of, and for the benefit of, that Merchant. The Merchant
            determines the scope of that data.
          </li>
          <li>
            <strong className="text-ink">
              Operator of the Forestea café website.
            </strong>{" "}
            Customers may independently register an account on our website, save
            favorites, and view order history. Because customers register with
            our website rather than through the Clover POS, we act on our own
            behalf for those website account features, and this Privacy Policy
            describes those practices as well.
          </li>
        </ul>
        <p>
          Payment card data entered in the Clover Hosted iFrame is handled by
          Clover and its payment systems. We do not store full payment card
          numbers, CVV, or full track data on Forestea servers.
        </p>
      </LegalSection>

      <LegalSection title="3. Information we collect">
        <LegalSubheading>
          Information we collect when a customer makes a payment
        </LegalSubheading>
        <p>
          When a customer places an online order and pays, we collect
          information about the transaction, which may include personal data.
          Information about transactions includes the name associated with the
          order, the café location, date and time of the transaction, the
          transaction amount, and information about the goods purchased in the
          transaction.
        </p>
        <p>
          In addition, we collect payment tokens and charge and order
          identifiers returned by Clover, and the IP address associated with the
          checkout request for fraud prevention and payment processing context.
          We do not collect or store complete card numbers, CVV, or full track
          data.
        </p>

        <LegalSubheading>
          Additional information customers provide ancillary to a payment
        </LegalSubheading>
        <p>We may collect additional information ancillary to the payment:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Customer email address and phone number, used to confirm the order
            and notify the customer when it is ready for pickup
          </li>
          <li>
            Billing address fields provided for card verification and receipts
          </li>
          <li>
            Pickup notes and other order instructions the customer chooses to
            provide
          </li>
        </ul>
        <p>
          We do not currently collect marketing preferences, loyalty program
          activity, birthdates, or delivery addresses, because the Services are
          for in-store pickup only.
        </p>

        <LegalSubheading>Website account information</LegalSubheading>
        <p>
          If a customer creates an account on our website, we collect their name,
          email address, password (stored only as a secure hash), optional
          profile image, saved favorite menu items, order history, and
          authentication provider details if they choose to sign in with Google.
          We also use cookies and session tokens necessary to keep the customer
          signed in.
        </p>

        <LegalSubheading>Information about Merchant personnel</LegalSubheading>
        <p>
          We do not request or collect Clover employee data such as clock-in and
          clock-out times, shifts, or tips earned. For administrators of the
          Forestea website, we process the account information described above
          plus records of admin actions such as connecting or disconnecting
          Clover and publishing café content.
        </p>

        <LegalSubheading>
          Information provided through the Merchant&apos;s Clover connection
        </LegalSubheading>
        <p>
          Through the Merchant&apos;s authorization, we receive Clover OAuth
          access and refresh tokens and merchant identifiers needed to keep the
          website connected, along with inventory data such as categories,
          items, modifiers, and prices. Inventory data is business data and
          generally does not contain personal data.
        </p>
      </LegalSection>

      <LegalSection title="4. How we use the information we collect">
        <p>
          We use the personal data we collect for or on behalf of a Merchant to
          provide the functionality of our application:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Display live menu data read from Clover inventory</li>
          <li>Create Clover orders for online pickup orders</li>
          <li>
            Process ecommerce payments through Clover Hosted iFrame and record
            the resulting charge against the order
          </li>
          <li>
            Fulfill orders, including notifying the customer when an order is
            ready for pickup, and support refunds or order questions
          </li>
        </ul>
        <p>
          For website accounts operated by us, we use personal data to create and
          maintain the account, authenticate sign-in, store favorites, display
          order history, and handle password resets.
        </p>
        <p>We may also use personal data for related internal purposes:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            To provide information about the application, such as important
            updates or changes and security alerts
          </li>
          <li>To measure performance of and improve the application</li>
          <li>
            To respond to inquiries, complaints, and requests for customer
            support
          </li>
        </ul>
        <p>
          In addition, we may use personal data as we believe necessary or
          appropriate to (a) comply with applicable laws and lawful requests and
          legal processes, such as to respond to subpoenas or requests from
          government authorities; (b) enforce the terms and conditions that
          govern our application; (c) protect our rights, privacy, safety or
          property, and/or that of you or others; and (d) protect, investigate
          and deter against fraudulent, harmful, unauthorized, unethical or
          illegal activity.
        </p>
      </LegalSection>

      <LegalSection title="5. How we share information">
        <p>We may share personal data that we collect with:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The Merchant from whom or on whose behalf we collected the personal
            data
          </li>
          <li>
            The platform on which our application runs, the Clover POS. You may
            view Clover&apos;s Privacy Notice at{" "}
            <a
              className="underline hover:text-ink"
              href="https://www.clover.com/privacy-policy"
            >
              https://www.clover.com/privacy-policy
            </a>
            .
          </li>
          <li>Third parties as a Merchant may direct</li>
          <li>
            Third-party service providers that help us operate, host, and
            improve the application, including hosting, database, and deployment
            providers, and optional authentication providers such as Google if
            social sign-in is enabled
          </li>
        </ul>
        <p>
          We may disclose personal data to government or law enforcement
          officials or private parties as required by law, and disclose and use
          such information as we believe necessary or appropriate to (a) comply
          with applicable laws and lawful requests and legal processes; (b)
          enforce the terms and conditions that govern our application; (c)
          protect our rights, privacy, safety or property, and/or that of you or
          others; and (d) protect, investigate and deter against fraudulent,
          harmful, unauthorized, unethical or illegal activity.
        </p>
        <p>
          We may sell or transfer some or all of our business or assets,
          including personal data, in connection with a business transaction (or
          potential business transaction) such as a merger, consolidation,
          acquisition, reorganization or sale of assets or in the event of
          bankruptcy, in which case we will make reasonable efforts to require
          the recipient to honor this Privacy Policy.
        </p>
        <p>
          We do not sell personal data, and we do not share personal data with
          third-party advertising networks.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and similar technologies">
        <p>
          We use essential cookies and similar technologies for authentication,
          session management, and security. These are required for signed-in
          features to work. We do not currently use third-party advertising
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="7. Do Not Track and cross-site tracking">
        <p>
          Some browsers offer a &quot;Do Not Track&quot; (DNT) setting. Because
          there is no consistent industry standard for responding to DNT
          signals, our Services do not currently respond to DNT browser signals.
        </p>
        <p>
          We do not allow third parties to collect personal data about you
          across websites and over time for advertising or analytics through our
          Services. Third-party payment and authentication providers, such as
          Clover and, if enabled, Google, may process information as needed to
          complete payments or sign-in, subject to their own policies.
        </p>
      </LegalSection>

      <LegalSection title="8. Data retention">
        <p>
          Subject to our agreement with a Merchant, we retain personal data for
          as long as necessary to (a) provide our products and services; (b)
          comply with legal, tax, and accounting obligations; (c) resolve
          disputes; and (d) enforce the terms of any agreement we may have with
          a Merchant. Clover OAuth credentials are retained while the merchant
          connection remains active and may be deleted when the connection is
          disconnected. You may contact us for additional information about our
          data retention practices in connection with the application.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use administrative, technical, and organizational safeguards
          appropriate to the nature of the data, including HTTPS, password
          hashing, restricted server-to-server secrets, and limited access to
          admin functions. No method of transmission or storage is completely
          secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="10. Your rights and choices">
        <LegalSubheading>Data subject rights</LegalSubheading>
        <p>
          To the extent that applicable law provides individuals with rights
          pertaining to their personal information, such as to review and
          request changes to their personal information, individuals should
          contact the Merchant with any requests pertaining to the
          Merchant&apos;s use of our application. To the extent that Clover is
          responsible for responding to data subject rights requests under
          applicable law, individuals may contact Clover with applicable
          requests as explained in Clover&apos;s Privacy Notice,{" "}
          <a
            className="underline hover:text-ink"
            href="https://www.clover.com/privacy-policy"
          >
            https://www.clover.com/privacy-policy
          </a>
          . We will assist a Merchant, or Clover, as applicable, in responding to
          such requests subject to our contract with a Merchant or Clover.
        </p>
        <p>
          For personal data relating to a Forestea website account that a
          customer created directly with us, you may contact us at the address
          below to request access, correction, or deletion. If you have an
          account, you may also update certain profile information by signing in,
          and you may stop using the Services at any time.
        </p>

        <LegalSubheading>Complaints</LegalSubheading>
        <p>
          If you have a complaint about our handling of personal data, you may
          contact us via the contact information provided below.
        </p>

        <LegalSubheading>Updates</LegalSubheading>
        <p>
          We reserve the right to modify this Privacy Policy at any time. We will
          notify you of updates by updating the effective date of this Privacy
          Policy and posting the revised policy at this URL.
        </p>
      </LegalSection>

      <LegalSection title="11. Children">
        <p>
          The Services are not directed to children under 13, and we do not
          knowingly collect personal data from children under 13. If you believe
          a child has provided personal data, contact us and we will take
          appropriate steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="12. Your California privacy rights">
        <p>
          As a California resident, you have the rights listed below. However,
          these rights are not absolute, and we may decline your request as
          permitted by the CCPA.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-ink">Information.</strong> You can request
            information about how we have collected and used your Personal
            Information during the past 12 months, including the categories
            collected, the categories of sources, the business or commercial
            purpose, the categories of third parties with whom we share it, and
            whether we have disclosed or sold it.
          </li>
          <li>
            <strong className="text-ink">Access.</strong> You can request a copy
            of the Personal Information that we maintain about you.
          </li>
          <li>
            <strong className="text-ink">Deletion.</strong> You can ask us to
            delete the Personal Information that we maintain about you.
          </li>
          <li>
            <strong className="text-ink">Correction.</strong> You can ask us to
            correct inaccurate Personal Information that we maintain about you.
          </li>
          <li>
            <strong className="text-ink">Nondiscrimination.</strong> You are
            entitled to exercise these rights free from discrimination, and we
            will not deny you goods or services, change prices, or decrease
            service quality for exercising your rights.
          </li>
        </ul>

        <LegalSubheading>How to exercise your rights</LegalSubheading>
        <p>
          You may submit an information, access, correction, or deletion request
          by emailing{" "}
          <a
            className="underline hover:text-ink"
            href="mailto:privacy@foresteacafe.com"
          >
            privacy@foresteacafe.com
          </a>{" "}
          or by writing to the postal address in the Contact section below.
        </p>
        <p>
          <strong className="text-ink">Identity verification.</strong> The CCPA
          requires us to verify the identity of the individual submitting the
          request before providing a substantive response. A request must be
          provided with sufficient detail to allow us to understand, evaluate,
          and respond, and the requester must provide sufficient information to
          allow us to reasonably verify that they are the person about whom we
          collected information. A request may also be made on behalf of your
          child under 13.
        </p>
        <p>
          <strong className="text-ink">Authorized agents.</strong> California
          residents can empower an &quot;authorized agent&quot; to submit
          requests on their behalf. We may require the authorized agent to have a
          written authorization confirming that authority.
        </p>

        <LegalSubheading>Sale of personal information</LegalSubheading>
        <p>
          We do not sell, as defined under the CCPA, your Personal Information to
          third parties. In the preceding twelve (12) months, we have not sold
          any personal information.
        </p>

        <LegalSubheading>
          Personal information that we collect, use and share
        </LegalSubheading>
        <p>
          The chart below summarizes our collection and sharing of Personal
          Information for business purposes during the last 12 months before the
          effective date of this Privacy Policy. &quot;Financial
          Information&quot; is limited to payment tokens and charge or order
          identifiers; we do not collect or store complete card numbers.
        </p>
        <LegalTable
          headers={[
            "Category",
            "Do we collect this information?",
            "Do we share this information for business purposes?",
          ]}
          rows={CCPA_ROWS}
        />
      </LegalSection>

      <LegalSection title="13. Additional information for Merchants located in Europe">
        <LegalSubheading>Controller</LegalSubheading>
        <p>
          With respect to the Forestea Integration App, we act as a data
          processor for and on behalf of the Merchant that has installed our
          application on their Clover POS. That Merchant is the controller of
          personal data that we process on its behalf. Clover is also a
          controller of personal data in some circumstances; Clover&apos;s
          Privacy Notice is available at{" "}
          <a
            className="underline hover:text-ink"
            href="https://www.clover.com/privacy-policy"
          >
            https://www.clover.com/privacy-policy
          </a>
          . For website accounts that customers create directly with us, we act
          as controller.
        </p>

        <LegalSubheading>Legal basis for processing</LegalSubheading>
        <p>
          We process personal data as directed or permitted by the Merchant that
          uses our application. The Merchant is responsible for establishing a
          legal basis for our processing of personal data for or on behalf of the
          Merchant. Where we act as controller for website accounts, we rely on
          performance of a contract, our legitimate interests in operating and
          securing the Services, consent where required, and compliance with
          legal obligations.
        </p>

        <LegalSubheading>Cross border data transfer</LegalSubheading>
        <p>
          When we transfer personal data outside of Europe (or the UK) to
          countries not deemed by the European Commission to provide an adequate
          level of protection for personal data, we make the transfer pursuant to
          one of the following transfer mechanisms:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            A contract approved by the European Commission (sometimes called
            &quot;Model Clauses&quot; or &quot;Standard Contractual
            Clauses&quot;)
          </li>
          <li>The recipient&apos;s Binding Corporate Rules</li>
          <li>
            The consent of the individual to whom the personal data relates
          </li>
          <li>
            Other mechanisms or legal grounds as may be permitted under
            applicable European law
          </li>
        </ul>
        <p>
          You may contact us with questions about our transfer mechanism.
        </p>

        <LegalSubheading>Data subject rights</LegalSubheading>
        <p>
          Under certain circumstances, data subjects in Europe and the UK have
          rights relating to their personal data, including the rights to request
          from the controller (a) access to their personal data; (b) correction
          of incomplete or inaccurate personal data; (c) erasure of personal
          data; (d) restriction of processing; and (e) a copy of the personal
          data they provided in a structured, commonly used and machine-readable
          format. Data subjects may also object to a controller&apos;s
          processing of personal data under certain circumstances. Where
          processing is based on consent, the data subject has the right to
          withdraw consent at any time; however, withdrawal will not affect the
          lawfulness of processing based on consent before its withdrawal. Data
          subjects may also file a complaint with a supervisory authority, whose
          contact information is available at{" "}
          <a
            className="underline hover:text-ink"
            href="https://edpb.europa.eu/about-edpb/board/members_en"
          >
            https://edpb.europa.eu/about-edpb/board/members_en
          </a>
          . Data subjects in Europe or the UK should direct any rights request to
          the appropriate controller.
        </p>
      </LegalSection>

      <LegalSection title="14. International users">
        <p>
          The Services are operated for a café located in Washington, United
          States. If you access the Services from outside the United States,
          your information may be processed in the United States.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact us">
        <p>
          You may contact us with any questions, comments, or complaints about
          this Privacy Policy or our privacy practices via:
        </p>
        <p>
          Forestea
          <br />
          15127 Main St E, Ste 102
          <br />
          Sumner, WA 98390, United States
          <br />
          Phone:{" "}
          <a className="underline hover:text-ink" href="tel:+14255307909">
            +1 (425) 530-7909
          </a>
          <br />
          Email:{" "}
          <a
            className="underline hover:text-ink"
            href="mailto:privacy@foresteacafe.com"
          >
            privacy@foresteacafe.com
          </a>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
