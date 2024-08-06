import React from "react";
interface Article {
  title: string;
  url: string;
  category: string;
  source: string;
  date?: string;
  author?: string;
  // 'The Guardian' | 'New York Times' | 'News API'
}

const Article = ({ articles }: { articles: Article[] }) => {
  return (
    <>
      {articles?.map(({ title, date, url, category, source, author }, index) => (
        <a href={url} className="card" key={index}>
          <div className="h-full px-[24px] pt-[24px] pb-[50px] sm:pb-[70px] relative">
            <h4 className="mb-[17px] object-left sm:object-center">{source}</h4>
            <span className="text-[15px] font-bold">{date?`Date: ${date}`:''} {author?`Authored: ${author}`:''}</span>
            <p className="leading-[19px] line-clamp-4 mt-[10px]">{title}</p>
            <span className="absolute bottom-[23px] right-[24px] text-[14px] font-bold">
              Category: {category}
            </span>
          </div>
        </a>
      ))}
    </>
  );
};

export default Article;
