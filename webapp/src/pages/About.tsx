import FAQ from "../components/ui/FAQ";

export default function About() {
  const faqItems = [
    {
      question: "What is Confidential DCA?",
      answer: "It’s a private dollar-cost averaging strategy using fully homomorphic encryption (FHE). Your plan amounts and intervals remain confidential while swaps are executed on-chain."
    },
    {
      question: "How are funds stored?",
      answer: "Funds are held securely in the contract’s escrow in USDC until swapped via scheduled batch executions."
    },
    {
      question: "Can I cancel a plan?",
      answer: "Yes. You can cancel anytime, and your remaining funds will be refunded to your wallet after decryption."
    },
    {
      question: "How does batch execution work?",
      answer: "Multiple user plans are combined into a single swap through Uniswap. This reduces gas costs and prevents timing leaks by aggregating executions."
    },
    {
      question: "What tokens can I swap into?",
      answer: "Only whitelisted pairs are supported. Currently, USDC is the input token, and the project owner decides which output tokens are allowed."
    },
    {
      question: "Who can trigger executions?",
      answer: "Executions can be triggered by keepers (bots) or any approved executor set by the contract owner. This ensures plans run without requiring manual user action."
    },
    {
      question: "How do withdrawals work?",
      answer: "After a batch executes, your pending output tokens are credited confidentially. You can withdraw anytime, and tokens will be sent directly to your wallet."
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto prose prose-invert">
      <FAQ items={faqItems} />
    </div>
  );
}
