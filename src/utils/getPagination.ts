import { SITE } from "@config";
import getPageNumbers from "./getPageNumbers";

interface GetPaginationProps<T> {
  entities: T;
  page: string | number;
  isIndex?: boolean;
}

const getPagination = <T>({
  entities,
  page,
  isIndex = false,
}: GetPaginationProps<T[]>) => {
  const totalPagesArray = getPageNumbers(entities.length);
  const totalPages = totalPagesArray.length;

  const currentPage = isIndex
    ? 1
    : page && !isNaN(Number(page)) && totalPagesArray.includes(Number(page))
      ? Number(page)
      : 0;

  const lastEntity = isIndex ? SITE.entitiesPerPage : currentPage * SITE.entitiesPerPage;
  const startEntity = isIndex ? 0 : lastEntity - SITE.entitiesPerPage;
  const paginatedEntities = entities.slice(startEntity, lastEntity);

  return {
    totalPages,
    currentPage,
    paginatedEntities,
  };
};

export default getPagination;
