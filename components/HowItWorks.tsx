const steps = [
  {
    number: "1",
    title: "Create an account",
    description: "Sign up for free in less than a minute.",
  },
  {
    number: "2",
    title: "Choose a scholar",
    description: "Browse verified Ulama and view their qualifications and expertise.",
  },
  {
    number: "3",
    title: "Ask your question",
    description: "Send your query privately and receive an authentic answer.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-center text-gray-600">
          Getting authentic guidance is simple.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-3 text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}