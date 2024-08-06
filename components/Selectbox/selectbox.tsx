import React, { useState, useEffect, useRef } from "react";
import styleBox from "../Selectbox/selectbox.module.scss";
import axios from "axios";
import to from "await-to-js";

interface IOptionLists {
    [keyName: string]: any;
    label?: string;
    key?: string;
}

interface ISelectDropDownProps {
    label: string;
    options: IOptionLists[] | string[];
    searchable?: boolean;
    selected?: string;
    setSelected: (
        selected: string,
        seletedItemObject?: { [keyName: string]: any }
    ) => void;
    searchPlaceholder?: string;
    error?: boolean;
    listKeyName?: string | number;
    listLabelName?: string;
    isLoading?: boolean;
    showInlineInput?: boolean;
    noOptionsMessage?: string;
    noSearchedOptionMessage?: string;
    multiSelect?: boolean;
    listUrl?: string;
    searchWithUrl?: boolean;
    urlQuery?: string;
    overlayList?: boolean;
}

const SelectDropDown = (props: ISelectDropDownProps) => {
    const {
        label,
        error = false,
        options: consumerPassedList,
        searchPlaceholder,
        searchable = false,
        multiSelect = true,
        listUrl,
        searchWithUrl,
        urlQuery,
        // selected: userPreselected,
        setSelected,
        listKeyName = "",
        listLabelName = "",
        isLoading: consumerDefinedLoding = false,
        showInlineInput = false,
        noOptionsMessage = "No Data in list Available",
        noSearchedOptionMessage = "No result found",
        overlayList,
    } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedList, setSelectedList] = useState([]);
    const [isLoading, setIsLoading] = useState(consumerDefinedLoding || false);
    const [options, setOptions] = useState(consumerPassedList || []);
    const wrapperRef = useRef(null);
    const listWrapperRef = useRef(null);

    const apiListFetch = async (searchString = "") => {
        setIsLoading(true);

        const url =
            urlQuery && searchString
                ? listUrl + `?${urlQuery}=${searchString}`
                : listUrl;

        const [error, list] = await to(axios.get(url));
        setIsLoading(false);
        if (error) {
            setErrorMessage("unable to fetch list");
        }
        if (list?.data?.entries) {
            setOptions(list.data.entries);
        }
    };

    useEffect(() => {
        if (listUrl) {
            (async () => {
                apiListFetch();
            })();
        }
    }, []);

    const toggle = (isOpen: boolean) => {
        setIsOpen(isOpen);
        setSearch("");
    };

    const selectedItems = () => {
        return (
            <div className={styleBox.selected_list_wrapper}>
                {selectedList.map((item, index) => (
                    <span
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            const temp = [...selectedList];
                            temp.splice(index, 1);
                            setSelectedList(temp);
                        }}
                    >
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    const onchangedHandler = (e: string) => {
        if (!selectedList.includes(e)) {
            // if selected item already present do not update state again
            let selectedItemObject;
            if (listKeyName) {
                selectedItemObject = options?.find((item) => item[listKeyName] === e);
            }
            setSelected(e, selectedItemObject);
            setSelectedList(multiSelect ? [...new Set([...selectedList, e])] : [e]);
            if (!multiSelect) {
                toggle(false);
            }
        }
        if (e === null) {
            setSelected(null, null);
        }
    };

    const dataOption = (dataList: IOptionLists) => {
        console.log(selectedList);
        const data = dataList.filter((val: any) => {
            if (
                !!val &&
                (val[listLabelName] || val)
                    ?.toLowerCase()
                    .startsWith(search?.toLowerCase())
            ) {
                return val;
            }
        });
        return (
            <>
                {data?.length > 0 ? (
                    data.map((val: any, i: number) => {
                        return (
                            <div
                                className={`${styleBox.dropdown_menu_item} 
                ${showInlineInput && styleBox.withShowInlineInput} 
                ${selectedList.includes(val[listKeyName] || val) &&
                                    styleBox.selectedItem
                                    }
                `}
                                key={i}
                                onClick={() => onchangedHandler(val[listLabelName] || val)}
                            >
                                {<div>{val[listLabelName] || val} </div>}
                            </div>
                        );
                    })
                ) : (
                    <div>{noSearchedOptionMessage}</div>
                )}
            </>
        );
    };

    const searchInputBox = () => {
        return isOpen ? (
            <input
                className={`${showInlineInput ? styleBox.inlineSearch : styleBox.search}`}
                type="text"
                value={search}
                placeholder={searchPlaceholder}
                onChange={(e) => {
                    if (listUrl && searchWithUrl && urlQuery) {
                        apiListFetch(e.target.value);
                    }
                    setSearch(e.target.value);
                }}
                ref={(input) => {
                    if (isOpen && input) {
                        input.focus({ preventScroll: true });
                    }
                }}
            />
        ) : (
            selectedItems()
        );
    };

    const dataOptionsList = () => {
        return (
            <>
                {searchable && !showInlineInput && (
                    <div className={styleBox.searchBox_dropDown}>{searchInputBox()}</div>
                )}

                {!options?.length ? (
                    <div className={`${styleBox.dropdown_menu_item}`}>
                        {noOptionsMessage}
                    </div>
                ) : (
                    <>{isLoading ? "Loading" : dataOption(options)}</>
                )}
            </>
        );
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                !overlayList &&
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                if (isOpen) toggle(false);
            }
            if (
                overlayList &&
                listWrapperRef.current &&
                !listWrapperRef.current.contains(event.target)
            ) {
                if (isOpen) toggle(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside, true);
        }
        return () => {
            console.log("return----");
            if (!overlayList) {
                document.removeEventListener("mousedown", handleClickOutside, true);
            }
        };
    }, [isOpen]);

    useEffect(()=>{
        if(selectedList.length === 0){ 
            setSelected(null)
        }
    },[selectedList]);

    return (
        <div
            className={`${styleBox.dropdown_wrapper} ${errorMessage ? styleBox.errorContainer : ""
                }`}
            ref={wrapperRef}
        >
            <div
                className={`${styleBox.dropdown_toggle} ${error ? styleBox.errorState : ""}`}
                onClick={() => toggle(!isOpen)}
            >
                <div className="w-100 d-flex flex-column align-items-start">
                    {label && (
                        <div
                            className={`${(showInlineInput && searchable) || selectedList.length
                                ? selectedList.length || isOpen
                                    ? styleBox.floating_label
                                    : styleBox.inlineInputLabel
                                : styleBox.inlineInputLabel
                                }`}
                        >
                            {isLoading ? "Loading" : label}
                        </div>
                    )}
                    {showInlineInput && searchable ? (
                        <div className="pt-3 truncate">{searchInputBox()}</div>
                    ) : (
                        <div className="pt-3 truncate">
                            {!!selectedList.length && !isLoading && selectedItems()}
                        </div>
                    )}
                </div>
                {isLoading ? (
                    <span>loader</span>
                ) : (
                    <div
                        className={`${styleBox.dropDownArrow} ${isOpen ? styleBox.upArrow : ""}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="m11.3 14.3l-2.6-2.6q-.475-.475-.212-1.087T9.425 10h5.15q.675 0 .938.613T15.3 11.7l-2.6 2.6q-.15.15-.325.225T12 14.6q-.2 0-.375-.075T11.3 14.3Z"
                            />
                        </svg>
                    </div>
                )}
            </div>
            {isOpen && (
                <div
                    className={`${styleBox.menu_wrapper} ${overlayList ? styleBox.overlay_list : ""
                        }`}
                >
                    <div ref={listWrapperRef} className={styleBox.list_wrapper}>
                        {dataOptionsList()}
                    </div>
                </div>
            )}

            {errorMessage && <p className={styleBox.errorMessage}>{errorMessage}</p>}
        </div>
    );
};
export default SelectDropDown;
