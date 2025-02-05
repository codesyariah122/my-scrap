import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface ScrapeParams {
    url: string;
    selector: string;
}

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const useScrape = () => {
    return useMutation({
        mutationFn: async ({ url, selector }: ScrapeParams) => {
            const { data } = await apiClient.get(`/scrape?url=${encodeURIComponent(url)}&selector=${encodeURIComponent(selector)}`);

            const transformedData = Array.isArray(data) ? data : Object.values(data);

            return transformedData;
        },
    });
};
