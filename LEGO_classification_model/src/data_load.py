# data tools
import os
from tensorflow.keras.preprocessing import image_dataset_from_directory

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "out")
FIG_DIR = os.path.join(OUTPUT_DIR, "fig")

training_path = os.path.join(DATA_DIR, "train")
test_path = os.path.join(DATA_DIR, "test")


# this function loads train, validation and test data
def get_train_val_test_data(train_data_path, test_data_path):

    data_train = image_dataset_from_directory(   
        directory = train_data_path,
        labels='inferred',
        label_mode='categorical',
        batch_size=64,
        image_size=(224, 224),
        shuffle=True,
        seed=50,
        validation_split=0.2,
        subset='training',
        verbose=True)

    data_validate = image_dataset_from_directory(   
        directory = train_data_path,
        labels='inferred',
        label_mode='categorical',
        batch_size=64,
        image_size=(224, 224),
        shuffle=True,
        seed=50,
        validation_split=0.2,
        subset='validation',
        verbose=True)

    data_test = image_dataset_from_directory(   
        directory = test_data_path,
        labels='inferred',
        label_mode='categorical',
        batch_size=64,
        image_size=(224, 224),
        shuffle=False,
        verbose=True)

    class_names = data_test.class_names
    return data_train, data_validate, data_test, class_names


def load_data():     
    data_train, data_validate, data_test, class_names = get_train_val_test_data(training_path, test_path)
    return  data_train, data_validate, data_test, class_names




if __name__ == "__main__":
    load_data()

