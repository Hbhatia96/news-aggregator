import React, { useState, useEffect } from "react";
import SelectDropDown from "../components/Selectbox/selectbox";
import ArticleListing from "../components/articleListing";
import axios from "axios";
import {category, source, author} from "../constants.ts";
import Pagination from "../components/pagination";

export default function Index(props: any) {

  const [categoryValue, setCategory] = useState(null);
  const [sourceValue, setSource] = useState<"The Guardian" | "New York Times" | "News API" | null>(null);
  const [authorValue, setAuthor] = useState(null);
  const [fetchingState, setFetchingState] = useState(false);
  const [fetchedArticles, setFetchedArticles] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [fetchingError, setFetchingError] = useState(null);

  const filterUpdate = () => {
    setFetchingState(true);
    setFetchingError(null);


    const apiCalls = [];

    if (sourceValue === null || sourceValue === "New York Times") {
      apiCalls.push(
        axios.get(
          `https://api.nytimes.com/svc/search/v2/articlesearch.json`,
          {
            params: {
              ...(categoryValue && !authorValue && { fq: `news_desk:(${categoryValue.toLowerCase()})` }),
              ...(authorValue && !categoryValue && { fq: `byline:(${authorValue.toLowerCase()})` }),
              ...(categoryValue && authorValue && { fq: `byline:(${authorValue.toLowerCase()}) AND news_desk:(${categoryValue.toLowerCase()})` }),
              "api-key": "CoM9aAiLqoV5OWD2UNNIdmQjnPy28VON",
              page: pageIndex,
            },
          }
        )
      );
    } else {
      apiCalls.push(Promise.resolve(null));
    }

    if ((sourceValue === null || sourceValue === "The Guardian") && !authorValue) {
      apiCalls.push(
        axios.get(`https://content.guardianapis.com/search`, {
          params: {
            ...(categoryValue && { section: categoryValue.toLowerCase() }),
            "api-key": "885f8978-5015-4870-a9a0-a6721b70a3d1",
            "show-tags":"contributor",
            page: pageIndex,
          },
        }),
      );
    } else {
      apiCalls.push(Promise.resolve(null));
    }

    if ((sourceValue === null || sourceValue === "News API") && !authorValue) {
      apiCalls.push(
        axios.get(`https://newsapi.org/v2/top-headlines`, {
          params: {
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
            // This will ensure you get a two-digit day and month.
            // console.log('ttttt-----',nytimesData, guardianData);

            const transformNYTimesData = () => {
              const data = !nytimesData? []: nytimesData.data.response.docs.map(
                ({
                  headline,
                  byline,
                  web_url,
                  news_desk,
                }: {
                  headline: { main: string };
                  byline: {original: string};
                  web_url: string;
                  news_desk: string;
                }) => {
                  return {
                    title: headline.main,
                    author: byline.original,
                    url: web_url,
                    category: news_desk,
                    source: "New York Times",
                  };
                }
              );
              return data;
            };
            const transformGuardiansData = () => {
              const data = !guardianData? [] : guardianData.data.response.results.map(
                ({ tags, webTitle, webUrl, pillarName }: any) => {
                  return {
                    title: webTitle,
                    author: `By ${tags[0].webTitle}`,
                    url: webUrl,
                    category: pillarName,
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
                      author,
                      title,
                      url,
                      source,
                    }: any) => {
                      return {
                        title,
                        author: `By ${author}`,
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
  }, [categoryValue, sourceValue, pageIndex, authorValue]);

  return (
    <>
      <section className="h-[280px] md:h-[360px] heroBanner">
        <h1>Personalized News Feed</h1>
      </section>
      <div className="flex sm:flex-row flex-col md:flex-nowrap flex-wrap mx-[10px] my-[10px]">

        <div className="sm:w-[200px] mr-[20px] mb-[20px] w-full">
          <SelectDropDown
            searchPlaceholder="Select Source"
            searchable={true}
            multiSelect={false}
            showInlineInput={false}
            label={"Source"}
            options={source}
            setSelected={(key) => {
              setSource(key?key:null);
            }}
          ></SelectDropDown>
        </div>
        <div className="sm:w-[200px] mr-[20px] mb-[20px] w-full">
          <SelectDropDown
            searchPlaceholder="Select Category"
            searchable={true}
            multiSelect={false}
            showInlineInput={false}
            label={"Category"}
            options={category}
            setSelected={(key, selectedObject) => {
              setCategory(key?key:null)
            }}
          ></SelectDropDown>
        </div>
        <div className="sm:w-[200px] mr-[20px] mb-[20px] w-full">
          <SelectDropDown
            searchPlaceholder="Select Author"
            searchable={true}
            multiSelect={false}
            showInlineInput={false}
            label={"Author"}
            options={author}
            setSelected={(key) => {
              setAuthor(key?key:null)
            }}
          ></SelectDropDown>
        </div>
      </div>

      <ArticleListing fetchingError={fetchingError} fetchingState={fetchingState} fetchedArticles={fetchedArticles}/>
      <Pagination pageIndex={pageIndex} setPageIndex={setPageIndex} fetchedArticles={!!fetchedArticles}/>
    </>
  );
}

