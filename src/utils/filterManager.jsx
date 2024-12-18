const defaultOptions = {
    Date: {
        default: "newest",
        type: "sort", // Indicates sorting
        options: {
            newest: (a, b) => b.Date - a.Date,
            oldest: (a, b) => a.Date - b.Date,
        },
    },
    DateRange: {
        default: null,
        type: "filter", // Indicates filtering
        options: {
            past_week: (item) => {
                const oneWeekAgo = Date.now() / 1000 - 7 * 24 * 60 * 60;
                return item.Date >= oneWeekAgo;
            },
            past_month: (item) => {
                const oneMonthAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;
                return item.Date >= oneMonthAgo;
            },
        },
    },
    Channel: {
        default: "all",
        type: "filter",
        options: {
            all: () => true, // Always include all channels
            specificChannel: (item, selectedChannel) => item.channelId === selectedChannel,
        },
    },
    User: {
        default: null,
        type: "filter",
        options: {
            specificUser: (item, selectedUser) => item.Poster === selectedUser,
        },
    },
};

class FilterManager {
    constructor(options) {
        this.options = options; // Centralized options definition
        this.defaultFilters = {}; // Store default values for all filters
        this.currentFilters = {}; // Store current filter values

        // Initialize default and current filters from options
        for (const [key, value] of Object.entries(options)) {
            this.defaultFilters[key] = value.default;
            this.currentFilters[key] = value.default;
        }
    }

    // Get default filters
    getDefault() {
        return { ...this.defaultFilters };
    }

    // Reset all filters to default values
    resetAll() {
        this.currentFilters = { ...this.defaultFilters };
    }

    // Reset a specific filter to its default value
    resetFilter(filterName) {
        if (this.defaultFilters.hasOwnProperty(filterName)) {
            this.currentFilters[filterName] = this.defaultFilters[filterName];
        }
    }

    // Return filters that differ from the default state
    getModified() {
        const modified = {};
        for (const [key, value] of Object.entries(this.currentFilters)) {
            if (value !== this.defaultFilters[key]) {
                modified[key] = value;
            }
        }
        return modified;
    }

    // Set a filter value (only if it's valid)
    setFilter(filterName, filterValue) {
        const filter = this.options[filterName];
        if (filter && filter.options?.hasOwnProperty(filterValue)) {
            this.currentFilters[filterName] = filterValue;
        }
    }

    // Get the available options for a specific filter
    getOptions(filterName) {
        return Object.keys(this.options[filterName]?.options || {});
    }

    // Apply filters and sorting to the provided data
    filter(rawData) {
        const filters = [];
        let sortFunction = null;

        // Prepare filter and sort functions based on currentFilters
        for (const [filterName, filterValue] of Object.entries(this.currentFilters)) {
            const filter = this.options[filterName];
            if (!filterValue || !filter) continue;

            if (filter.type === "filter") {
                const filterFn = filter.options[filterValue];
                if (filterFn) filters.push(filterFn);
            } else if (filter.type === "sort") {
                sortFunction = filter.options[filterValue];
            }
        }

        // Apply all filters in one pass
        const filteredData = rawData.filter((item) =>
            filters.every((filterFn) => filterFn(item))
        );

        // Apply sort if applicable
        if (sortFunction) {
            filteredData.sort(sortFunction);
        }

        return filteredData;
    }
}

export {
    defaultOptions,
    FilterManager
};