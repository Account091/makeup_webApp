import type { Metadata } from "next";
import CityPage from "../../components/site/CityPage";
import { SITE_IMAGES } from "../../lib/site-images";

export const metadata: Metadata = {
  title: "Bridal Makeup Artist for Udaipur Weddings",
  description: "Bridal and party makeup for lake-side and palace weddings in Udaipur by Makeovers by Prachi. Book online.",
};

export default function Page() {
  return (
    <CityPage
      path="/udaipur"
      eyebrow="Udaipur"
      title="Bridal makeup for Udaipur lake & palace weddings"
      intro="Getting married in Udaipur? We travel from Jodhpur with our full kit for your wedding day and functions."
      cityKey="udaipur" bookCity="Udaipur"
      heroImage={SITE_IMAGES.cities.udaipur}
      highlights={[
        "Bridal looks that photograph beautifully in daylight and evening light.",
        "Makeup at your hotel or palace venue, timed to your muhurat.",
        "A fixed travel fee, shown upfront before you pay anything.",
        "Family and bridesmaid makeup can be arranged on request.",
      ]}
    />
  );
}
