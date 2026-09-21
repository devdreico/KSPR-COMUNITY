import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from './components/Hero';
import PurchaseCard from './components/PurchaseCard';
import FeaturesBar from './components/FeaturesBar';
import HowItWorks from './components/HowItWorks';
import ClosingBanner from './components/ClosingBanner';
import ResultPage from './components/ResultPage';

function HomePage() {
  return (
    <Layout>
      <Hero />
      <PurchaseCard />
      <FeaturesBar />
      <HowItWorks />
      <ClosingBanner />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/resultado" element={<ResultPage />} />
    </Routes>
  );
}
