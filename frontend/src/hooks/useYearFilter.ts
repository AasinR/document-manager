import { useEffect, useState } from "react";
import { YearFilterType } from "../utils/data";
import { getYearUrlParam } from "../utils/search";

function useYearFilter(searchParams: URLSearchParams) {
    const [activeYearFilter, setActiveYearFilter] = useState<YearFilterType>(
        YearFilterType.NONE
    );
    const [yearFilterValue, setYearFilterValue] = useState<YearFilterValue>({});

    useEffect(() => {
        const value = getYearUrlParam(searchParams);
        if (Object.keys(value).length === 0) return;
        setYearFilterValue(value);
        if (value.exact !== undefined)
            setActiveYearFilter(YearFilterType.EXACT);
        else setActiveYearFilter(YearFilterType.RANGE);
    }, [searchParams]);

    const handleYearTypeSelect = (yearType: YearFilterType) => {
        if (yearType === activeYearFilter) return;
        setActiveYearFilter(yearType);

        let newYearValue: YearFilterValue = {};
        switch (yearType) {
            case YearFilterType.NONE:
                newYearValue = {};
                break;
            case YearFilterType.EXACT:
                newYearValue = {
                    exact: yearFilterValue?.to ?? undefined,
                };
                break;
            case YearFilterType.RANGE:
                newYearValue = {
                    from: yearFilterValue?.exact ?? null,
                    to: yearFilterValue?.exact ?? null,
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

    const updateYearFromValue = (
        value: string,
        isValueCheck: boolean = false
    ) => {
        let newValue = value ? parseInt(value, 10) : null;
        if (isValueCheck && newValue != null && yearFilterValue?.to != null) {
            newValue =
                newValue > yearFilterValue.to ? yearFilterValue.to : newValue;
        }
        setYearFilterValue({
            from: newValue,
            to: yearFilterValue?.to,
        });
    };

    const updateYearToValue = (
        value: string,
        isValueCheck: boolean = false
    ) => {
        let newValue = value ? parseInt(value, 10) : null;
        if (isValueCheck && newValue != null && yearFilterValue?.from != null) {
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

    const resetYearFilter = () => {
        setActiveYearFilter(YearFilterType.NONE);
        setYearFilterValue({});
    };

    return {
        activeYearFilter,
        yearFilterValue,
        handleYearTypeSelect,
        updateExactYearValue,
        updateYearFromValue,
        updateYearToValue,
        resetYearFilter,
    };
}

export default useYearFilter;
