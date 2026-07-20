import os
import glob
import random
import shutil

# path setup
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "out")
FIG_DIR = os.path.join(OUTPUT_DIR, "fig")


# this function creates a folder under provided path
def create_folder(path):
    if not os.path.exists(path):
        print('no folder')
        os.makedirs(path)

# this function creates new folder paths for the copied folders.
def create_copy_paths(paths, current_folder_path, copy_folder_path):
    new_path_list = []
    for path in paths:
        cut_path = path.replace(current_folder_path, "")
        cut_path = cut_path.lstrip(os.sep)
        new_path = os.path.join(copy_folder_path, cut_path)
        new_path_list.append(new_path)
        
    return new_path_list


# this function makes a copy of a folder under provided path
def copy_all_files(paths, copy_paths):
    for idx, path in enumerate(paths):
        shutil.copy(path, copy_paths[idx]) 


# this function is used to split the data into test and train set
def split_data(lego_data_folder_path):
    # findig all the LEGO block type folders
    all_cropped_img_folders = glob.glob(os.path.join(lego_data_folder_path, "*"))
    # creating train and test folders
    create_folder(os.path.join(DATA_DIR, "train"))
    create_folder(os.path.join(DATA_DIR, "test"))

    # this loop roons for each LEGO block type folder 
    for folder in all_cropped_img_folders:
        # setting up a new path name
        folder_name = folder.replace(lego_data_folder_path, "")
        folder_name = folder_name.lstrip(os.sep)
        # creating a subfolder for the block type in the train and test folders
        create_folder(os.path.join(DATA_DIR, "train", folder_name))
        create_folder(os.path.join(DATA_DIR, "test", folder_name))
        all_img_paths = glob.glob(os.path.join(folder, "*"))

        # finding all images in the folder
        all_ids = [i for (i, p) in enumerate(all_img_paths)]
        paths = [p for (i, p) in enumerate(all_img_paths)]
        # splitting the images randomly into the train and test set
        test_split_ids = random.sample(all_ids, int(all_ids[-1]*0.2))
        train_split_ids = [i for i in all_ids if i not in test_split_ids]

        test_split = [paths[i] for i in test_split_ids]
        train_split = [paths[i] for i in train_split_ids]

        # creating copies of the images in the respective folders based on the train/test split
        new_test_split_paths = create_copy_paths(test_split, lego_data_folder_path, os.path.join(DATA_DIR, "test"))
        new_train_split_paths = create_copy_paths(train_split, lego_data_folder_path, os.path.join(DATA_DIR, "train"))
        copy_all_files(test_split, new_test_split_paths)
        copy_all_files(train_split, new_train_split_paths)


if __name__ == "__main__":
    split_data()