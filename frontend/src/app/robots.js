export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/doctor/dashboard/", "/patient/dashboard/", "/auth/"],
            },
        ],
        sitemap: "https://www.indiatopdoctors.com/sitemap.xml",
    };
}
