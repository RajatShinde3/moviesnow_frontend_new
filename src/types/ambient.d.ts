declare module 'react-dropzone' {
  export function useDropzone(options?: any): any;
}

declare module '@tanstack/react-table' {
  export function useReactTable(options: any): any;
  export function getCoreRowModel(): any;
  export function getFilteredRowModel(): any;
  export function getPaginationRowModel(): any;
  export function getSortedRowModel(): any;
  export function flexRender(element: any, context: any): any;
}

declare module 'uuid' {
  export function v4(): string;
}

declare module 'socket.io-client' {
  export function io(url: string, options?: any): any;
}