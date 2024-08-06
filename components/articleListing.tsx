import React from "react";
import Article from "./article";

interface Article {
  title: string;
  date: string;
  url: string;
  category: string;
  source: string;
  // 'The Guardian' | 'New York Times' | 'News API'
}

const ArticleListing = ({
  fetchedArticles,
  fetchingState,
  fetchingError
}: {
  fetchedArticles: Article[] | null;
  fetchingState: boolean | null;
  fetchingError: any;
}) => {
  return (
    <>
      <section className="pt-[40px] sm:pb-[60px] pb-[59px]">
        <div className="container !px-0 !md:px-[16px]">
          <h5 className="mb-[24px]">Article Listing</h5>
          {fetchingState && !fetchingError && (
            <div className="bg-slate-300 text-center">
              Loading...
            </div>
          )}

          {!fetchingState && !fetchedArticles && <>no articles found</>}

          {fetchingState && !!fetchingError && <div>some error occured please try after some time</div>}

          {!fetchingState && fetchedArticles && (
            <div className="sm:grid flex flex-col items-center lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 px-[16px] pb-[21px]">
              <Article articles={fetchedArticles} />
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default ArticleListing;
