import type { Metadata } from "next";
import CityPage from "../../components/site/CityPage";
import { SITE_IMAGES } from "../../lib/site-images";

export const metadata: Metadata = {
  title: "Bridal Makeup Artist in Jodhpur",
  description: "Bridal, engagement and party makeup in Jodhpur by Makeovers by Prachi. Check your date and book online.",
};

export default function Page() {
  return (
    <CityPage
      path="/jodhpur"
      eyebrow="Jodhpur"
      title="Bridal makeup in Jodhpur, from our home studio"
      intro="Jodhpur is where we are based. Get ready at the studio or we come to your home, hotel or venue anywhere in the city."
      cityKey="jodhpur" bookCity="Jodhpur"
      heroImage={SITE_IMAGES.cities.jodhpur}
      highlights={[
        "Traditional Rajasthani bridal looks with poshak and rajputi jewellery setting.",
        "HD and airbrush finishes that last through long ceremonies.",
        "Hair styling and dupatta / saree draping included in bridal packages.",
        "Getting ready at home, at the hotel or at the venue.",
      ]}
    />
  );
}
