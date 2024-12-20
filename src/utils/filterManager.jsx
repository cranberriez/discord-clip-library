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
        default: null,
        type: "filter",
        matchStrategy: "exact",
    },
    Poster: {
        default: null,
        type: "filter",
        matchStrategy: "exact",
    },
    Search: {
        default: null,
        type: "filter",
        matchStrategy: "includes",
    }
};

// Helper functions
// Similarity function (ensure it's included)
function levenshteinDistanceOptimized(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    if (a.length > b.length) {
        [a, b] = [b, a];
    }

    let previousRow = Array(a.length + 1).fill(0);
    for (let i = 0; i <= a.length; i++) {
        previousRow[i] = i;
    }

    for (let j = 1; j <= b.length; j++) {
        let currentRow = [j];
        for (let i = 1; i <= a.length; i++) {
            if (b[j - 1] === a[i - 1]) {
                currentRow.push(previousRow[i - 1]);
            } else {
                currentRow.push(1 + Math.min(
                    previousRow[i],
                    currentRow[i - 1],
                    previousRow[i - 1]
                ));
            }
        }
        previousRow = currentRow;
    }

    return previousRow[a.length];
}

function similarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0;

    const distance = levenshteinDistanceOptimized(a.toLowerCase(), b.toLowerCase());
    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

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

    // Returns any filter that is different from its default
    getChangedFilters() {
        const changedFilters = {};
        for (const [key, currentValue] of Object.entries(this.currentFilters)) {
            const defaultValue = this.defaultFilters[key];
            if (currentValue !== defaultValue) {
                changedFilters[key] = currentValue;
            }
        }
        return changedFilters;
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
                const filterOption = filterConfig.options?.[filterValue];
                if (typeof filterOption === "function") {
                    // If the option is a function, execute it to get the actual filter function
                    filters.push(filterOption());
                } else {
                    // Otherwise, use default matching logic
                    filters.push((item) => this.matchItem(item, filterName, filterValue, filterConfig.matchStrategy));
                }
            } else if (filterConfig.type === "sort") {
                sortFunction = filterConfig.options?.[filterValue];
            }
        }

        const filteredData = baseData.filter((item) =>
            filters.every((filterFn) => filterFn(item))
        );

        if (sortFunction) {
            filteredData.sort(sortFunction);
        }

        return filteredData;
    }

    // Matching logic based on matchStrategy
    matchItem(item, filterName, filterValue, strategy) {
        if (filterName === "Search") {
            // Normalize Filename and Description
            const filename = (item.Filename || "").replace(/_/g, ' ').toLowerCase();
            const description = (item.Description || "").toLowerCase();
            const query = filterValue.toLowerCase();

            if (strategy === "includes") {
                // Check if query is a substring of Filename or Description
                return filename.includes(query) || description.includes(query);
            }
        }

        const fieldValue = item[filterName];

        if (strategy === "exact") {
            return fieldValue === filterValue;
        } else if (strategy === "fuzzy") {
            return similarity(filterValue, fieldValue || "") >= 0.8;
        } else if (strategy === "includes") {
            return (fieldValue || "").toLowerCase().includes(filterValue.toLowerCase());
        }
        return false;
    }

}

export default FilterManager;


export {
    defaultOptions,
    FilterManager
};