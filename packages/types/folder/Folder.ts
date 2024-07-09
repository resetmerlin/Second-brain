type TFolder = {
  name: string;
  _id: string;
  type: "folder" | "file";
  children?: TFolder[];
};

export default TFolder;
