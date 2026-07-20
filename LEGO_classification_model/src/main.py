# import functions
import os
import argparse
from data_setup import split_data
from data_load import load_data
from cnn_classifier import run_pipline_cnn
from vgg16_classifier import run_pipline_vgg16

# setup paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
training_path = os.path.join(DATA_DIR, "train")
test_path = os.path.join(DATA_DIR, "test")

# get data setup information
def file_loader():
    parser = argparse.ArgumentParser(description="Do you have separate test and train subfolders in the data folder?If you do, write 'y' otherwise, provide a path to your lego data folder.")
    parser.add_argument("--input",
                        '-i',
                        required=True,
                        help='Put y for yes or path to a data folder.')
    
    args = parser.parse_args()
    return args

data_folder_structure_answer = file_loader().input

# split data if necessary
if data_folder_structure_answer.lower() != 'y' :
    print(data_folder_structure_answer)
    split_data(data_folder_structure_answer)
else:
    print("data split not necessary")

# loading in the data
data_train, data_validate, data_test, labels = load_data()

# running both models
run_pipline_cnn(data_train, data_test, data_validate, labels, "model_performance_cnn.png", "classification_report_cnn.txt")
run_pipline_vgg16(data_train, data_test, data_validate, labels, "model_performance_vgg16.png", "classification_report_vgg16.txt")