import React from "react";

const Pagination = ({ pageIndex, fetchedArticles, setPageIndex  }: { pageIndex: number, fetchedArticles: boolean, setPageIndex:any }) => {
  return (
     <div className="flex justify-center items-center mb-[20px]">
      {pageIndex !== 1 && (<span onClick={()=>{setPageIndex(pageIndex-1)}} className="cursor-pointer rounded-full bg-slate-300 text-center px-[10px] py-[5px] mx-[20px]">Back</span>)} 
      {pageIndex}
      {pageIndex >= 1 && fetchedArticles &&(<span onClick={()=>{setPageIndex(pageIndex+1)}} className="cursor-pointer rounded-full bg-slate-300 text-center px-[10px] py-[5px] mx-[20px]">Next</span>)} 
    </div>
  );
};

export default Pagination;
