import os
import pandas as pd
import cv2

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUT_DIR = os.path.join(PROJECT_DIR, "out")

# this function saves path for each page of the newspaper 
def get_newspaper(newspaper):
    # setting up all newspaper page paths
    all_newspaper_paths = sorted(os.listdir(os.path.join(DATA_DIR, newspaper)))

    # stripping the paths to date and page designation only
    all_stripped_paths = [path.split(newspaper+"-")[1] for path in all_newspaper_paths]

    # the path and the stripped path are comnined into a dictonary entry
    path_dict = [{"path": os.path.join(DATA_DIR, newspaper, all_newspaper_paths[idx]), "stripped_path": all_stripped_paths[idx], "newspaper": newspaper} for idx in range(1, len(all_newspaper_paths), 1)]

    return path_dict


# this function is used to detect faces per each page
def detect_face(path, mtcnn):
    # a newspaper page is loaded in using the openCV package
    img = cv2.imread(os.path.join(DATA_DIR, path))

    # this loop exist to account for any images that are too corrupted to be read in
    if img is None:
        return path
    else:
        # is the image is read in succesfully, it is converted to grayscale
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # any faces on the page are detected using MTCNN
        boxes, _ = mtcnn.detect(img)

        # calculating the amount of faces detected
        if boxes is not None:
            face_count = len(boxes)
        else:
            face_count = 0
        return face_count


# this function reads the publication decade for the page from its path
def get_decade(path):
    path_elm = path.split("-")
    year = path_elm[0]
    decade = int(year[0:3] + "0")
    return decade

# this function creates a dataframe containing description of each page
def get_full_df(path_dict, newspaper, mtcnn):
    df_list = []
    # this list is to register any images that could not be read in with openCV
    skipped_imgs = []

    # the loop runs for each page of the newspaper
    for entry in path_dict:

        # the descriptive values are read using the functions described above
        path, stripped_path, newspaper = entry.values()

        decade = get_decade(stripped_path)

        face_count = detect_face(path, mtcnn)

        # saves path if the page was corrupted
        if isinstance(face_count, str):
            skipped_imgs.append(path)
        else:
            # creating a row for each page
            new_df_row = {
                "newspaper":newspaper,
                "path":path, 
                "decade":decade, 
                "count":face_count, 
            }
            df_list.append(new_df_row)
    
    # the dataframe is saved in the "in/face_csv"
    pd.DataFrame(skipped_imgs).to_csv(os.path.join(OUT_DIR, newspaper + "_skipped_imgs.csv"))
    df = pd.DataFrame(df_list)
    file_name = newspaper + "_raw_face_data.csv"
    df.to_csv(os.path.join(DATA_DIR, "face_csv", file_name))

    return df


def get_raw_data(newspaper, mtcnn):
    path_dict = get_newspaper(newspaper)
    df = get_full_df(path_dict, newspaper, mtcnn)
    return df

if __name__ == "__main__":
    get_raw_data()
