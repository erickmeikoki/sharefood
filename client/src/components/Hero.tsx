interface HeroProps {
  onCreateClick: () => void;
}

export default function Hero({ onCreateClick }: HeroProps) {
  return (
    <section className="text-center mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-4">Share & Reduce Food Waste</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Connect with neighbors and share excess food in your community. Help reduce waste and feed those in need.
      </p>
      <button 
        onClick={onCreateClick}
        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
      >
        Share Your Food
      </button>
    </section>
  );
}
