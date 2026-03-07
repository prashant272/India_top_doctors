const BASE_URL = "https://www.indiatopdoctors.com";

export default async function sitemap() {
    // Static routes
    const routes = ["", "/about", "/contact", "/blog", "/hospital", "/patient/doctors"].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1 : 0.8,
    }));

    try {
        // Attempt to fetch doctors for dynamic routes
        // Note: In a real production build, you'd use your actual API URL
        const response = await fetch(`${baseURL}/patient/getdoctors`, { next: { revalidate: 3600 } });
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            const doctorRoutes = data.data.map((doctor) => ({
                url: `${BASE_URL}/patient/doctors/${doctor._id}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.7,
            }));
            return [...routes, ...doctorRoutes];
        }
    } catch (error) {
        console.error("Sitemap generation error:", error);
    }

    return routes;
}
