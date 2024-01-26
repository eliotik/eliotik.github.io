import { SITE } from "@config";

const getPageNumbers = (numberOfEntities: number) => {
  const numberOfPages = numberOfEntities / Number(SITE.entitiesPerPage);

  let pageNumbers: number[] = [];
  for (let i = 1; i <= Math.ceil(numberOfPages); i++) {
    pageNumbers = [...pageNumbers, i];
  }

  return pageNumbers;
};

export default getPageNumbers;
