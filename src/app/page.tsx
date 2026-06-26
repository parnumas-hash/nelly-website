import HeroVideo from "@/components/home/HeroVideo";
import ShopByBrand from "@/components/home/ShopByBrand";
import NewCollection from "@/components/home/NewCollection";
import BestSeller from "@/components/home/BestSeller";
import TravelWithPets from "@/components/home/TravelWithPets";
import HomeLiving from "@/components/home/HomeLiving";
import EcoFriendly from "@/components/home/EcoFriendly";
import InstagramGallery from "@/components/home/InstagramGallery";
import AboutNellyGroup from "@/components/home/AboutNellyGroup";
import StoreLocator from "@/components/home/StoreLocator";
import Newsletter from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <HeroVideo />
      <ShopByBrand />
      <NewCollection />
      <BestSeller />
      <TravelWithPets />
      <HomeLiving />
      <EcoFriendly />
      <InstagramGallery />
      <AboutNellyGroup />
      <StoreLocator />
      <Newsletter />
    </>
  );
}
