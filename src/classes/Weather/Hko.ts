import axios from "axios";
import type { HkoWarningSummary } from "../../types/hko.types.js";

const ApiUrls = {
    WARNSUM: "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc"
};

export const Hko = {
    async getWarningSummary() {
        const response = await axios.get<HkoWarningSummary>(ApiUrls.WARNSUM);
        return response.data;
    }
}
