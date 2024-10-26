from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.properties import ObjectProperty
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout

class Calculator(BoxLayout):
    display = ObjectProperty(None)

    def button_click(self, text):
        current = self.display.text
        if current == "0":
            self.display.text = text
        else:
            self.display.text += text

    def clear(self):
        self.display.text = "0"

    def calculate(self):
        try:
            self.display.text = str(eval(self.display.text))
        except Exception:
            self.display.text = "Error"

class CalculatorApp(App):
    def build(self):
        # Create the main layout
        main_layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Create the display
        self.display = TextInput(
            text="0",
            font_size=40,
            halign="right",
            multiline=False,
            readonly=True,
            background_color=(1, 1, 1, 1),
            size_hint=(1, 0.2)
        )
        main_layout.add_widget(self.display)

        # Define button layout
        buttons = [
            ('7', '8', '9', '/'),
            ('4', '5', '6', '*'),
            ('1', '2', '3', '-'),
            ('C', '0', '=', '+')
        ]

        # Create button grid
        button_grid = GridLayout(cols=4, spacing=10, size_hint=(1, 0.8))
        for row in buttons:
            for label in row:
                if label == "=":
                    button = Button(
                        text=label,
                        on_press=lambda instance: self.calculate(),
                        background_color=(0.5, 0.8, 1, 1)
                    )
                elif label == "C":
                    button = Button(
                        text=label,
                        on_press=lambda instance: self.clear(),
                        background_color=(1, 0.4, 0.4, 1)
                    )
                else:
                    button = Button(
                        text=label,
                        on_press=lambda instance, lbl=label: self.button_click(lbl),
                        background_color=(0.9, 0.9, 0.9, 1)
                    )
                button_grid.add_widget(button)

        main_layout.add_widget(button_grid)
        return main_layout

    def button_click(self, text):
        current = self.display.text
        if current == "0":
            self.display.text = text
        else:
            self.display.text += text

    def clear(self):
        self.display.text = "0"

    def calculate(self):
        try:
            self.display.text = str(eval(self.display.text))
        except Exception:
            self.display.text = "Error"

if __name__ == '__main__':
    CalculatorApp().run()