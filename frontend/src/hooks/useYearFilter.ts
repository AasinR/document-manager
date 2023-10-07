import { useState } from "react";
import { YearFilterType } from "../utils/data";

function useYearFilter() {
    const [activeYearFilter, setActiveYearFilter] = useState<YearFilterType>(
        YearFilterType.NONE
    );
    const [yearFilterValue, setYearFilterValue] =
        useState<YearFilterValue | null>(null);

    const handleYearTypeSelect = (yearType: YearFilterType) => {
        if (yearType === activeYearFilter) return;
        setActiveYearFilter(yearType);

        let newYearValue: YearFilterValue | null = null;
        switch (yearType) {
            case YearFilterType.NONE:
                newYearValue = null;
                break;
            case YearFilterType.EXACT:
                newYearValue = {
                    exact: yearFilterValue?.to,
                };
                break;
            case YearFilterType.RANGE:
                newYearValue = {
                    from: yearFilterValue?.exact,
                    to: yearFilterValue?.exact,
                };
                break;
            default:
                break;
        }
        setYearFilterValue(newYearValue);
    };

    const updateExactYearValue = (value: string) => {
        const newValue = value ? parseInt(value, 10) : undefined;
        setYearFilterValue({
            exact: newValue,
        });
    };

    const updateYearFromValue = (value: string) => {
        let newValue = value ? parseInt(value, 10) : undefined;
        if (newValue && yearFilterValue?.to) {
            newValue =
                newValue > yearFilterValue.to ? yearFilterValue.to : newValue;
        }
        setYearFilterValue({
            from: newValue,
            to: yearFilterValue?.to,
        });
    };

    const updateYearToValue = (value: string) => {
        let newValue = value ? parseInt(value, 10) : undefined;
        if (newValue && yearFilterValue?.from) {
            newValue =
                newValue < yearFilterValue.from
                    ? yearFilterValue.from
                    : newValue;
        }
        setYearFilterValue({
            from: yearFilterValue?.from,
            to: newValue,
        });
    };

    return {
        activeYearFilter,
        yearFilterValue,
        handleYearTypeSelect,
        updateExactYearValue,
        updateYearFromValue,
        updateYearToValue,
    };
}

export default useYearFilter;
