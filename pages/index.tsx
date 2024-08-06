import React, { useState, useEffect } from "react";
import SelectDropDown from "../components/Selectbox/selectbox";
import ArticleListing from "../components/articleListing";
import DatePicker from "react-date-picker";
import axios from "axios";
import { category, source } from "../constants.ts";
import { debounce, formattedDate } from "../utils/utils.tsx";
import Pagination from "../components/pagination";

export default function Index() {
  const [searchText, setSearchText] = useState(null);
  const [date, setDate] = useState<any>(null);
  const [categoryValue, setCategory] = useState(null);
  const [sourceValue, setSource] = useState<
    "The Guardian" | "New York Times" | "News API" | null
  >(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [fetchingState, setFetchingState] = useState(false);
  const [fetchedArticles, setFetchedArticles] = useState<any>(null);
  const [fetchingError, setFetchingError] = useState(null);

  const filterUpdate = () => {
    setFetchingState(true);
    setFetchingError(null);

    const apiCalls = [];

    if (sourceValue === null || sourceValue === "New York Times") {
      apiCalls.push(
        axios.get(`https://api.nytimes.com/svc/search/v2/articlesearch.json`, {
          params: {
            ...(searchText && { q: searchText }),
            ...(categoryValue && {
              fq: `news_desk:(${categoryValue.toLowerCase()})`,
            }),
            ...(date && { begin_date: formattedDate(date, "noSpace") }),
            "api-key": "CoM9aAiLqoV5OWD2UNNIdmQjnPy28VON",
            page: pageIndex,
          },
        })
      );
    } else {
      apiCalls.push(Promise.resolve(null));
    }

    if (sourceValue === null || sourceValue === "The Guardian") {
      apiCalls.push(
        axios.get(`https://content.guardianapis.com/search`, {
          params: {
            ...(searchText && { q: searchText }),
            ...(categoryValue && { section: categoryValue.toLowerCase() }),
            ...(date && { "from-date": formattedDate(date, "yearFirst") }),
            "api-key": "885f8978-5015-4870-a9a0-a6721b70a3d1",
            page: pageIndex,
            "show-tags": "contributor", // Include this to get author information
          },
        })
      );
    } else {
      apiCalls.push(Promise.resolve(null));
    }

    if (sourceValue === null || sourceValue === "News API") {
      apiCalls.push(
        axios.get(`https://newsapi.org/v2/top-headlines`, {
          params: {
            ...(searchText && { q: searchText }),
            ...(categoryValue && { category: categoryValue.toLowerCase() }),
            apiKey: "699a3fd0a7c6476fa5fe84cef41783c1",
            country: "us",
            pageSize: 10,
            page: pageIndex
          },
        })
      );
    } else {
      apiCalls.push(Promise.resolve(null));
    }

    axios
      .all(apiCalls)
      .then(
        axios.spread(
          (
            nytimesData,
            guardianData,
            newsapi
          ) => {

            const transformNYTimesData = () => {
              const data = !nytimesData
                ? []
                : nytimesData.data.response.docs.map(
                    ({
                      headline,
                      pub_date,
                      web_url,
                      news_desk,
                    }: {
                      headline: { main: string };
                      pub_date: string;
                      web_url: string;
                      news_desk: string;
                    }) => {
                      return {
                        title: headline.main,
                        date: formattedDate(pub_date),
                        url: web_url,
                        category: news_desk,
                        source: "New York Times",
                      };
                    }
                  );
              return data;
            };
            const transformGuardiansData = () => {
              const data = !guardianData
                ? []
                : guardianData.data.response.results.map(
                    ({
                      webPublicationDate,
                      webTitle,
                      webUrl,
                      sectionName,
                    }: any) => {
                      return {
                        title: webTitle,
                        date: formattedDate(webPublicationDate),
                        url: webUrl,
                        category: sectionName,
                        source: "The Guardian",
                      };
                    }
                  );
              return data;
            };
            const transformNewsApiData = () => {
              const data = !newsapi
                ? []
                : newsapi.data.articles.map(
                    ({
                      publishedAt,
                      title,
                      url,
                      source,
                    }: any) => {
                      return {
                        title,
                        date: formattedDate(publishedAt),
                        url,
                        category: categoryValue?categoryValue:source.name,
                        source: "News API",
                      };
                    }
                  );
              return data;
            };

            setFetchingState(false);

            const articlesList = [
              ...transformNYTimesData(),
              ...transformGuardiansData(),
              ...transformNewsApiData()
            ];

            setFetchedArticles(
              articlesList && articlesList.length ? articlesList : null
            );
          }
        )
      )
      .catch((error) => {
        setFetchingError(error);
        console.log("erorr-----", error);
      });
  };

  useEffect(() => {
    filterUpdate();
  }, [categoryValue, searchText, sourceValue, date, pageIndex]);

  return (
    <>
      <section className="h-[280px] md:h-[360px] heroBanner">
        <h1>Welcome to Article Search</h1>
      </section>
      <div className="flex sm:flex-row flex-col md:flex-nowrap flex-wrap mx-[10px] my-[10px]">
        <div className="mr-[20px] mb-[20px] h-[60px]">
          <input
            className="border-solid border-black border rounded-lg p-[10px] w-full h-full"
            placeholder="Search article"
            onChange={debounce((e) => {
              setSearchText(e.target.value);
            }, 500)}
          />
        </div>
        <DatePicker
          className="mr-[20px] shrink-0 mb-[20px] h-[60px]"
          value={date}
          onChange={(value) => {
            setDate(value);
          }}
        />

        <div className="sm:w-[200px] mr-[20px] mb-[20px] w-full">
          <SelectDropDown
            searchPlaceholder="Search Source"
            searchable={true}
            multiSelect={false}
            showInlineInput={false}
            label={"Source"}
            options={source}
            setSelected={(key) => {
              setSource(key ? key : null);
            }}
          ></SelectDropDown>
        </div>
        <div className="sm:w-[200px] mr-[20px] mb-[20px] w-full">
          <SelectDropDown
            searchPlaceholder="Search Category"
            searchable={true}
            multiSelect={false}
            showInlineInput={false}
            label={"Category"}
            options={category}
            setSelected={(key, selectedObject) => {
              setCategory(key ? key : null);
            }}
          ></SelectDropDown>
        </div>
      </div>

      <ArticleListing
        fetchingState={fetchingState}
        fetchedArticles={fetchedArticles}
        fetchingError={fetchingError}
      />
      <Pagination
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        fetchedArticles={!!fetchedArticles}
      />
    </>
  );
}
