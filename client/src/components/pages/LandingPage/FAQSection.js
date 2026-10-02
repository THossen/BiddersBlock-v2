import { Link } from "react-router-dom";

const FAQS = [
  [
    "Do I need an account to bid?",
    "Yes. Create an account or log in before placing a bid. You can browse auction listings without signing in.",
  ],
  [
    "What happens if someone outbids me?",
    "The current bid updates live. You can also find auctions where you are leading or have been outbid in My bids on your profile.",
  ],
  [
    "How do I sell an item?",
    "Log in, open your profile, and choose Sell an item. Add the item details, image, starting price, and auction schedule.",
  ],
  [
    "When does an auction end?",
    "Each listing has its own end time. Bidding closes when that time is reached, and the highest bidder is recorded as the winner.",
  ],
  [
    "Can I bid on my own listing?",
    "No. Sellers cannot bid on their own auctions.",
  ],
  [
    "Does checkout charge real money?",
    "No. Checkout is a demo flow that records an order for the winner. It does not collect payment or charge a card.",
  ],
];

const FAQSection = () => (
  <section className="border-t border-slate-200 bg-white/70 px-4 py-16 sm:py-20">
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Good to know
        </p>
        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Frequently asked questions
        </h2>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white/80">
        {FAQS.map(([question, answer]) => (
          <details key={question} className="group px-4 open:bg-indigo-50/50 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-slate-800 marker:hidden [&::-webkit-details-marker]:hidden">
              <span>{question}</span>
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-lg font-normal leading-none text-indigo-700 transition group-open:rotate-45 group-open:border-indigo-300"
              >
                +
              </span>
            </summary>
            <p className="max-w-3xl pb-5 pr-10 text-sm leading-6 text-slate-600">
              {answer}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Still have a question?{" "}
        <Link to="/Contact" className="font-semibold text-indigo-700 hover:text-indigo-900">
          Contact us
        </Link>
        .
      </p>
    </div>
  </section>
);

export default FAQSection;