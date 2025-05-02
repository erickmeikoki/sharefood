import { Leaf } from "lucide-react";

interface HeaderProps {
  onCreateClick: () => void;
}

export default function Header({ onCreateClick }: HeaderProps) {
  return (
    <header className="bg-card shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-2xl font-bold text-primary">FoodShare</h1>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <button 
                  onClick={onCreateClick}
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                >
                  Share Food
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
