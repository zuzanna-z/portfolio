# data tools
import os
import numpy as np
from plot_fig import plot_history
from sklearn.metrics import classification_report

from tensorflow.keras.backend import clear_session
from tensorflow.keras.datasets import cifar10
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input 
from tensorflow.keras.layers import Rescaling
from tensorflow.keras.layers import (Conv2D, 
                                     MaxPool2D, 
                                     Activation, 
                                     Flatten, 
                                     Dense)
                                
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.data import AUTOTUNE

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "out")
FIG_DIR = os.path.join(OUTPUT_DIR, "fig")

# this function defines the basic cnn model layer by layer
def define_model():

    model = Sequential()
    model.add(Rescaling(1./255))
    model.add(Conv2D(64, 
                    (3,3),
                    padding="same"))
    model.add(Activation("relu"))
    model.add(MaxPool2D(pool_size = (2,2)))

    model.add(Conv2D(50, 
                    (5,5),
                    padding="same"))
    model.add(Activation("relu"))
    model.add(MaxPool2D(pool_size = (2,2)))

    model.add(Conv2D(150, 
                    (5,5),
                    padding="same"))
    model.add(Activation("relu"))
    model.add(MaxPool2D(pool_size = (2,2)))

    model.add(Flatten())
    model.add(Dense(128))
    model.add(Activation("relu"))

    model.add(Dense(20))
    model.add(Activation("softmax"))

    return model


# this function fits the model defined by the define_model() function on the data. The model runs for 10 epochs. The fit for each epoch is tested on the validation data.
def run_model(data, val_data, plot_path):
    model = define_model()
    model.compile(loss="categorical_crossentropy",
                optimizer="sgd",
                metrics=["accuracy"])

    H = model.fit(data,
                validation_data= val_data,
                epochs=10)
    
    plot_history(H, 10, plot_path)
    return model


# this function test the model trained in the run_model() function on the test data. The results are then saved and the model is cleared from the session.
def test_model(test_data, model, labels, report_path):
    y_true_all = []
    y_pred_all = []

    for x_batch, y_batch in test_data:
        preds = model(x_batch, training=False)

        y_true_all.extend(y_batch.numpy().argmax(axis=1))
        y_pred_all.extend(preds.numpy().argmax(axis=1))

    report = classification_report(
        y_true_all,
        y_pred_all,
        target_names=labels
    )
    with open(os.path.join(OUTPUT_DIR, report_path), "w") as file:
            file.write(report)
    del model
    clear_session()
    

# this function runs the whole pipline
def run_pipline_cnn(data, test_data, val_data, labels, plot_path, report_path):
    model = run_model(data, val_data, plot_path)
    test_model(test_data, model, labels, report_path)

if __name__ == "__main__":
    run_pipline_cnn()





    