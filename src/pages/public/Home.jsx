import Hero from '../../sections/Hero';
import TrustedBrands from '../../sections/TrustedBrands';
import SearchSection from '../../sections/SearchSection';
import UserTypes from '../../sections/UserTypes';
import Features from '../../sections/Features';
import HowItWorks from '../../sections/HowItWorks';
import Testimonials from '../../sections/Testimonials';
import Industries from '../../sections/Industries';
import Statistics from '../../sections/Statistics';
import PricingSection from '../../sections/PricingSection';
import FAQSection from '../../sections/FAQSection';

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBrands />
      <SearchSection />
      <UserTypes />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Industries />
      <Statistics />
      <PricingSection />
      <FAQSection />
    </>
  );
}
