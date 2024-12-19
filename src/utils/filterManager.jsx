const defaultOptions = {
    Date: {
        default: "newest",
        type: "sort",
        options: {
            newest: (a, b) => b.Date - a.Date,
            oldest: (a, b) => a.Date - b.Date,
        },
    },
    DateRange: {
        default: null,
        type: "filter",
        options: {
            past_week: () => {
                const oneWeekAgo = Date.now() / 1000 - 7 * 24 * 60 * 60;
                return (item) => item.Date >= oneWeekAgo;
            },
            past_month: () => {
                const oneMonthAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;
                return (item) => item.Date >= oneMonthAgo;
            },
            past_year: () => {
                const oneYearAgo = Date.now() / 1000 - 365 * 24 * 60 * 60;
                return (item) => item.Date >= oneYearAgo;
            },
        },
    },
    Expired: {
        default: null,
        type: "filter",
        options: {
            hide_expired: () => {
                const curDate = Date.now()

                return (item) => item.Expire_Timestamp >= curDate
            }
        }
    },
    channelId: {
        default: null, // No channel selected by default
        type: "filter",
    },
    Poster: {
        default: null, // No user selected by default
        type: "filter",
    },
};

class FilterManager {
    constructor(options) {
        this.options = options; // Centralized filter configuration
        this.defaultFilters = {}; // Default filter values
        this.currentFilters = {}; // Current active filters
        this.subscribers = []; // List of subscribers for reactive updates

        // Initialize default and current filters
        for (const [key, value] of Object.entries(options)) {
            this.defaultFilters[key] = value.default;
            this.currentFilters[key] = value.default;
        }
    }

    // Subscribe to changes (e.g., from React components)
    subscribe(callback) {
        if (typeof callback === "function") {
            this.subscribers.push(callback);
        }
    }

    // Notify all subscribers of changes
    notify() {
        this.subscribers.forEach((callback) => callback(this.getCurrentFilters()));
    }

    // Get the current filter values
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    getCurrentFilterState(filterName) {
        return this.currentFilters[filterName]
    }

    // Get the default filter values
    getDefaultFilters() {
        return { ...this.defaultFilters };
    }

    // Reset all filters to their default values
    resetAllFilters() {
        this.currentFilters = { ...this.defaultFilters };
        this.notify(); // Notify subscribers of the reset
    }

    // Reset a specific filter to its default value
    resetFilter(filterName) {
        if (this.defaultFilters.hasOwnProperty(filterName)) {
            this.currentFilters[filterName] = this.defaultFilters[filterName];
            this.notify(); // Notify subscribers of the reset
        }
    }

    // Set a specific filter value
    setFilter(filterName, filterValue) {
        // Validate the filter name and value
        const filterConfig = this.options[filterName];
        const isValidValue =
            !filterConfig?.hasOwnProperty("options") || // No predefined options
            filterConfig?.options?.hasOwnProperty(filterValue) || // Valid option
            filterValue === null; // Clearing the filter is valid

        if (this.currentFilters[filterName] == filterValue) {
            console.warn(`Filter ${filterName} already set to that value`)
            return
        }

        if (!filterConfig) {
            console.warn(`Filter "${filterName}" does not exist.`);
            return;
        }

        if (!isValidValue) {
            console.warn(`Invalid value "${filterValue}" for filter "${filterName}".`);
            return;
        }

        // Update the filter and notify subscribers
        this.currentFilters[filterName] = filterValue;
        this.notify();
    }

    // Get available options for a specific filter
    getFilterOptions(filterName) {
        return Object.keys(this.options[filterName]?.options || {});
    }

    // Apply all filters and sorting to the provided data
    applyFilters(baseData) {
        const filters = [];
        let sortFunction = null;

        for (const [filterName, filterValue] of Object.entries(this.currentFilters)) {
            const filterConfig = this.options[filterName];
            if (!filterConfig || filterValue == null) continue;

            if (filterConfig.type === "filter") {
                if (!filterConfig.options) {
                    filters.push((item) => item[filterName] === filterValue);
                    console.log(filterName, filterValue)
                } else {
                    const filterFn = filterConfig.options?.[filterValue];
                    if (filterFn) {
                        filters.push(filterFn());
                    }
                }
            } else if (filterConfig.type === "sort") {
                sortFunction = filterConfig.options?.[filterValue];
            }
        }

        // Apply all filters
        const filteredData = baseData.filter((item) =>
            filters.every((filterFn) => filterFn(item))
        );

        // Apply sorting if applicable
        if (sortFunction) {
            filteredData.sort(sortFunction);
        }

        return filteredData;
    }
}

export default FilterManager;


export {
    defaultOptions,
    FilterManager
};