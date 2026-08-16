import type { Metadata } from "next";
import {
  LegalDocument,
  LegalSection,
  LegalSubheading,
} from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service — Forestea",
  description:
    "Terms of Service and End-User License Agreement for the Forestea website, online ordering, and the Forestea Integration App for Clover.",
};

const EFFECTIVE_DATE = "August 15, 2026";

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service and End-User License Agreement"
      effectiveDate={EFFECTIVE_DATE}
    >
      <LegalSection title="1. Agreement">
        <p>
          These Terms of Service, which also serve as our End-User License
          Agreement (this &quot;Agreement&quot;), are between the business or
          individual accepting this Agreement (that business or individual being
          &quot;you&quot; or &quot;Merchant&quot; where the context concerns the
          application, or &quot;you&quot; as a website customer) and Forestea
          (&quot;Forestea,&quot; &quot;Developer,&quot; or &quot;App
          Provider&quot;).
        </p>
        <p>
          This Agreement governs your use of our software application, the
          Forestea Integration App, and the corresponding services it provides,
          together with our café website at{" "}
          <a
            className="underline hover:text-ink"
            href="https://www.foresteacafe.com"
          >
            https://www.foresteacafe.com
          </a>
          , online ordering, customer accounts, and admin tools, along with the
          associated documentation, proprietary rights, and intellectual property
          (together, the &quot;App&quot; or the &quot;Services&quot;).
        </p>
        <p>
          Review this Agreement completely. You agree to be bound by the terms of
          this Agreement when you accept it or otherwise download, install, copy,
          or use the App. If you do not agree to the terms of this Agreement, you
          must not download, install, copy, or use the App.
        </p>
        <p>
          This Agreement is solely between you and Forestea. Clover and its
          affiliates are not a party to this Agreement, are not the licensor or
          provider of the App, and are not liable to any person or entity in any
          way with respect to that person&apos;s or entity&apos;s use of the App.
        </p>
      </LegalSection>

      <LegalSection title="2. The App">
        <p>
          <strong className="text-ink">2.1</strong> The App will provide you with
          the ability to: connect the Forestea café website to a Clover merchant
          account through OAuth; read Clover inventory to display current
          categories, items, modifiers, and prices on the website; create Clover
          orders when a customer checks out for in-store pickup; process
          ecommerce card payments through the Clover Hosted iFrame and record the
          resulting charge against the corresponding order; and manage café
          content and the Clover connection through admin tools.
        </p>
        <p>
          <strong className="text-ink">2.2</strong> Developer grants you a
          limited, non-exclusive, non-transferable, non-sublicensable, revocable
          license during the Term of this Agreement to use the App solely for
          your internal business purposes. You will not otherwise distribute,
          lease, rent, host, sublicense, transfer, sell, export, modify, reverse
          engineer, decompile, copy, benchmark, create derivative works from, or
          attempt to derive the source code for the App. This license does not
          grant you any rights to Developer&apos;s (or any other third
          party&apos;s) trademarks, service marks, logos, trade dress, or other
          intellectual property unless provided with the App. Developer reserves
          to itself (or applicable third parties) all right, title, interest, and
          license (express or implied) to the App that are not specifically
          granted to you under this Agreement. You will preserve and display any
          proprietary notices, markings, or branding associated with use of the
          App.
        </p>
        <p>
          <strong className="text-ink">2.3</strong> The App may update
          automatically from time to time, and you may be required to accept
          these updates to continue using the App. Developer may perform
          maintenance on the App, which may result in service interruptions or
          delays from time to time. Developer may not support older versions of
          the App. You are solely responsible for obtaining all equipment and
          services (for example, Internet connectivity) necessary to access and
          use the App.
        </p>
      </LegalSection>

      <LegalSection title="3. Fees">
        <p>
          The Forestea Integration App is a private integration provided for
          Forestea&apos;s own café operations and is not offered as a paid
          subscription under this Agreement, so no monthly application fee is
          charged. Customers pay for menu items purchased at checkout. You are
          responsible for payment of all sales, use, excise, or similar taxes
          (excluding taxes based on Developer&apos;s income) imposed by a
          federal, state, or local tax authority. Payment processing fees charged
          by Clover or other payment providers are governed by those providers.
          You must notify Developer of any billing errors within 120 days from
          when an error appears, after which you release Developer from all
          liability for Losses (defined below) resulting from those errors.
        </p>
      </LegalSection>

      <LegalSection title="4. Term">
        <p>
          This Agreement commences when you accept it or otherwise download,
          install, copy, or use the App, and will continue until terminated (this
          period of time being the Agreement&apos;s &quot;Term&quot;).
        </p>
      </LegalSection>

      <LegalSection title="5. Suspension and termination">
        <p>
          <strong className="text-ink">5.1</strong> Developer may promptly
          suspend or terminate your use of the App if (1) you violate this
          Agreement&apos;s terms; (2) Developer believes your use of the App may
          damage its reputation or intellectual property rights; (3) Developer
          suspends or terminates its agreement(s) with any third party involved
          in providing the App; (4) you exceed normal and reasonable usage for
          the App; (5) you experience a bankruptcy or insolvency event; or (6) you
          are using the App for any fraudulent, illegal, or unauthorized purpose,
          or engage in willful misconduct with respect to use of the App. We may
          also suspend or terminate customer accounts that are inaccurate,
          abusive, or fraudulent.
        </p>
        <p>
          <strong className="text-ink">5.2</strong> You may terminate this
          Agreement at any time and for any reason (without cause) by providing
          notice to Developer, by disconnecting the Clover connection, or by
          discontinuing use of the Services. Provisions that by their nature
          should survive termination will survive.
        </p>
      </LegalSection>

      <LegalSection title="6. Customer orders, pickup, and payments">
        <p>
          Online orders are for in-store pickup at 15127 Main St E, Ste 102,
          Sumner, WA 98390, unless we clearly state otherwise. Menu items,
          prices, taxes, availability, and modifiers may change and are sourced
          from Clover inventory where connected.
        </p>
        <p>
          Payments are processed through the Clover Hosted iFrame and related
          ecommerce payment services. By placing an order, you authorize the
          applicable charge for the displayed total. We do not store full payment
          card numbers on Forestea servers.
        </p>
        <p>
          An order confirmation does not guarantee that every item remains
          available. If an item cannot be fulfilled, we may contact you,
          substitute with your approval where practical, refund the affected
          amount, or cancel the order as appropriate.
        </p>
      </LegalSection>

      <LegalSection title="7. Confidentiality, data, and ideas">
        <p>
          <strong className="text-ink">7.1</strong> Neither of us will disclose
          non-public information about the other&apos;s business, including
          without limitation the terms of this Agreement, technical
          specifications, customer lists, or information relating to a
          party&apos;s operational, strategic, or financial matters (together,
          &quot;Confidential Information&quot;). Confidential Information does
          not include information that (1) is or subsequently becomes publicly
          available through no fault of the recipient; (2) the recipient lawfully
          possesses before its disclosure; (3) is independently developed without
          reliance on the discloser&apos;s Confidential Information; or (4) is
          received from a third party that is not obligated to keep it
          confidential. Each of us will implement and maintain reasonable
          safeguards to protect the other&apos;s Confidential Information.
        </p>
        <p>
          <strong className="text-ink">7.2</strong> Neither of us may disclose
          the other&apos;s Confidential Information except (1) to our respective
          directors, officers, employees, or representatives that need to know it
          in order to perform our obligations under this Agreement; (2) in
          response to a subpoena or court order; or (3) as required by applicable
          law, rule, or regulation.
        </p>
        <p>
          <strong className="text-ink">7.3</strong> Developer may use data or
          information obtained through the App to provide and support its
          services and to maintain, secure, and improve the App, all subject to
          applicable Laws (defined below) and Section 10 of this Agreement.
          Information Developer collects about you or your consumers is subject to
          Developer&apos;s privacy policy, which is accessible at{" "}
          <a className="underline hover:text-ink" href="/privacy">
            https://www.foresteacafe.com/privacy
          </a>
          .
        </p>
        <p>
          <strong className="text-ink">7.4</strong> You may provide, or Developer
          may invite you to provide, comments or ideas about the App, including
          without limitation improvements to it (together, &quot;Ideas&quot;). By
          submitting any Ideas, you agree that (1) they are not Confidential
          Information; (2) they are not subject to any use or disclosure
          restrictions (express or implied); (3) you claim no rights in them; and
          (4) Developer has no obligation to notify or compensate you in
          connection with their disclosure or use. You release Developer from all
          liability or obligations that may arise from the receipt, review,
          disclosure, or use of any Idea that you submit.
        </p>
      </LegalSection>

      <LegalSection title="8. Account">
        <p>
          You may be required to register for an account with Developer to use
          the App or certain website features. You will provide accurate
          information when setting up your account and will maintain your account
          with current information. You are responsible for establishing
          safeguards designed to prevent unauthorized access to, disclosure, use,
          or alteration of your account, which may include user names, passwords,
          and other credentials. You must notify Developer if you discover a
          security breach involving your account or the App. You are responsible
          for any unauthorized access to, disclosure, use, or alteration of your
          account, the App, or other transaction information that arises through
          your systems or account. It is your responsibility to back up and
          maintain the accuracy and completeness of any content created, derived
          from, stored, or accessed through your account or your use of the App.
        </p>
        <p>
          Merchant and admin users must keep Clover credentials and admin access
          restricted to authorized staff. You are responsible for Clover
          configuration, menu accuracy, tax settings, and refunds initiated in
          Clover, and for compliance with card network and payment provider
          rules. Forestea is not Clover, does not control Clover&apos;s platform
          availability or policies, and does not act as Clover or any Clover
          affiliate when providing the Services.
        </p>
      </LegalSection>

      <LegalSection title="9. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the Services for illegal, fraudulent, or harmful activity</li>
          <li>
            Attempt to access another user&apos;s account, admin tools, or
            systems without authorization
          </li>
          <li>
            Reverse engineer, scrape excessively, overload, or disrupt the
            Services
          </li>
          <li>Upload malware or content that infringes others&apos; rights</li>
          <li>Misrepresent your identity or payment authorization</li>
        </ul>
      </LegalSection>

      <LegalSection title="10. Compliance with privacy laws">
        <p>
          App Provider makes the following additional commitments,
          representations, and warranties to you, Merchant:
        </p>
        <p>
          <strong className="text-ink">10.1</strong> App Provider will only
          process Merchant Data and Personal Information on behalf of, and as
          Service Provider of, the Merchant, and will not collect, retain, use,
          or disclose that data for any purpose other than to perform App
          Provider&apos;s obligations under this Agreement, as permitted under the
          CCPA and other applicable privacy and data protection laws
          (collectively, &quot;Privacy Laws&quot;). In no event will App Provider
          &quot;sell&quot; (as defined by Privacy Laws) any such personal
          information.
        </p>
        <p>
          <strong className="text-ink">10.2</strong> App Provider will not
          collect, use, retain, disclose, sell, or otherwise make Merchant Data
          or Personal Information available for App Provider&apos;s own
          commercial purposes or in a way that does not comply with the CCPA or
          other Privacy Laws.
        </p>
        <p>
          <strong className="text-ink">10.3</strong> App Provider will limit
          personal information collection, use, retention, and disclosure to
          activities reasonably necessary and proportionate to provide the
          Services set forth in this Agreement or another compatible operational
          purpose.
        </p>
      </LegalSection>

      <LegalSection title="11. Data subject rights — assistance with requests">
        <p>
          <strong className="text-ink">11.1</strong> App Provider will reasonably
          cooperate and assist Merchant with meeting Merchant&apos;s CCPA and
          Privacy Law compliance obligations and respond to CCPA-related
          inquiries, including responding to verifiable consumer requests, taking
          into account the nature of App Provider&apos;s processing and the
          information available to App Provider. App Provider will make available
          to Merchant, in a manner consistent with the functionality of the
          Services and App Provider&apos;s role as a Service Provider of Personal
          Information of data subjects, the ability to fulfill data subject
          requests to exercise their rights under Privacy Laws.
        </p>
        <p>
          <strong className="text-ink">11.2</strong> If App Provider receives a
          request from Merchant&apos;s data subject to exercise one or more of its
          rights under Privacy Laws in connection with the Services, App Provider
          will redirect the data subject to make its request directly to
          Merchant. Merchant will be responsible for responding to any such
          request including, where possible, by using the functionality of the
          Services. App Provider will comply with reasonable requests by Merchant
          to assist with Merchant&apos;s response to such a data subject request.
        </p>
        <p>
          <strong className="text-ink">11.3</strong> App Provider will notify the
          Merchant immediately if it receives any complaint, notice, or
          communication that directly or indirectly relates to either
          party&apos;s compliance with Privacy Laws relating to provisioning of
          the Services.
        </p>
      </LegalSection>

      <LegalSection title="12. Intellectual property and third-party services">
        <p>
          The Services, including website design, branding, software, and content
          we create, are owned by Forestea or our licensors. Menu item names and
          images sourced from Clover remain subject to the Merchant&apos;s and
          Clover&apos;s rights.
        </p>
        <p>
          The Services rely on third parties such as Clover, hosting providers,
          databases, and optional Google authentication. Your use of those
          services may also be subject to their terms and privacy notices. We are
          not responsible for third-party outages or policy changes outside our
          control.
        </p>
      </LegalSection>

      <LegalSection title="13. Risk allocation">
        <p>
          <strong className="text-ink">13.1</strong> The App is provided to you
          &quot;as-is&quot; and &quot;as-available.&quot; You are solely
          responsible for determining if the App meets your needs.{" "}
          <em>
            Developer disclaims all warranties (express or implied) related to
            your account or the App, including without limitation warranties of
            security, merchantability, fitness for a particular purpose,
            non-infringement, accuracy, and uninterrupted or error-free
            operation.
          </em>{" "}
          Developer is not responsible for any disclosures, modifications,
          deletions, or other errors that arise in connection with your use of
          the App due to its interaction with other applications or their
          content.
        </p>
        <p>
          <strong className="text-ink">13.2</strong> You will indemnify
          Developer, its directors, officers, employees, agents, subsidiaries,
          and affiliates against any third-party claims for losses, damages,
          costs, or expenses (including reasonable attorneys&apos; fees)
          (together, &quot;Losses&quot;) that result from your use or misuse of
          the App, or your breach of this Agreement. Developer may assume the
          defense of any third-party claims that you must indemnify it for (at
          your expense), and you will cooperate with the defense of those claims.
          You will not settle any third-party claims involving more than the
          payment of money without Developer&apos;s written consent.
        </p>
        <p>
          <strong className="text-ink">13.3</strong>{" "}
          <em>
            To the extent permitted by applicable law, Developer will not be
            liable to you for any lost profits, revenues, or business
            opportunities, nor any exemplary, punitive, special, indirect,
            incidental, or consequential damages, regardless of whether these
            damages were foreseeable or either of us was advised they were
            possible.
          </em>
        </p>
        <p>
          <strong className="text-ink">13.4</strong>{" "}
          <em>
            To the extent permitted by applicable law, Developer&apos;s total,
            aggregate liability to you for all Losses arising from any cause
            (regardless of the form of action or legal theory) in connection with
            this Agreement will not exceed the greater of the amounts you paid to
            Developer during the 3 months prior to a Loss or USD $100.
          </em>{" "}
          Some jurisdictions do not allow certain limitations; in those cases,
          the limitation applies to the fullest extent allowed.
        </p>
      </LegalSection>

      <LegalSection title="14. Communications">
        <p>
          You authorize Developer to communicate with you electronically or
          otherwise using the contact information you provide to it, for example
          via your account, the Internet, email, text, or calls to your mobile or
          other phone, in order to service your account and orders. You are
          responsible for any fees charged by your communications provider for
          phone, text, or email communications that Developer sends to you.
        </p>
      </LegalSection>

      <LegalSection title="15. General">
        <p>
          <strong className="text-ink">15.1</strong> You represent and warrant
          that you have authority to enter into this Agreement, creating
          performance obligations that are legally enforceable against you.
        </p>
        <p>
          <strong className="text-ink">15.2</strong> Developer may modify this
          Agreement from time to time and will provide you with notice when these
          modifications occur (notification may be through the App, email, a
          website, changes to the date shown at the top of this Agreement, or
          other electronic means). Your continued use of the App indicates your
          acceptance of any modifications to this Agreement. You must stop using
          and uninstall the App if you do not agree to any modifications that are
          made to this Agreement.
        </p>
        <p>
          <strong className="text-ink">15.3</strong> Each of us will comply with
          the laws, rules, and regulations (together, &quot;Laws&quot;) that apply
          to our respective performance under this Agreement, including without
          limitation laws related to the collection and use of consumer
          information obtained via the App. You will follow the requirements of
          all user documentation provided for the App. You will not use the App to
          access, store, or transmit materials that are tortious, libelous, or
          offensive; contain malicious code, viruses, time bombs, Trojan horses,
          bots, scripts, or other programs; or infringe third parties&apos;
          intellectual property rights.
        </p>
        <p>
          <strong className="text-ink">15.4</strong> This Agreement is governed by
          the laws of the State of Washington, without regard to its conflicts or
          choice of law statutes. The state and federal courts located in
          Washington are proper venue for any proceedings in connection with this
          Agreement.
        </p>
        <p>
          <strong className="text-ink">15.5</strong> This is the entire agreement
          between us, and supersedes any prior agreements related to its subject
          matter. Any sections or terms of this Agreement that are, or become,
          invalid or unenforceable will be severed, and the remaining terms will
          continue in effect. Developer is not waiving any of its rights under
          this Agreement if it delays their exercise or fails to exercise them. We
          are independent contractors. This Agreement does not create an agency,
          partnership, or joint venture of any kind.
        </p>
        <p>
          <strong className="text-ink">15.6</strong> You may not assign this
          Agreement without Developer&apos;s written consent, which assignment is
          voidable by Developer; however, Developer may assign this Agreement
          without notice to you or your consent.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact">
        <LegalSubheading>You may contact Developer at</LegalSubheading>
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
            href="mailto:support@foresteacafe.com"
          >
            support@foresteacafe.com
          </a>
          <br />
          Privacy requests:{" "}
          <a
            className="underline hover:text-ink"
            href="mailto:privacy@foresteacafe.com"
          >
            privacy@foresteacafe.com
          </a>
        </p>
        <p>
          Our Privacy Policy is available at{" "}
          <a className="underline hover:text-ink" href="/privacy">
            https://www.foresteacafe.com/privacy
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
