import pandas as pd
import sys

def predict(data):
    results = {"Number": [], "Prediction": []}
    for number in data['Number']:
        if number % 2 == 0:
            prediction = "Even"
        else:
            prediction = "Odd"
        results["Number"].append(number)
        results["Prediction"].append(prediction)
    return pd.DataFrame(results)

if __name__ == "__main__":
    # Sample data input
    input_data = pd.DataFrame({"Number": [int(arg) for arg in sys.argv[1:]]})
    predictions = predict(input_data)
    print(predictions)
