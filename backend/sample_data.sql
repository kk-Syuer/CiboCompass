-- Clean the database
DELETE FROM Feedbacks;
DELETE FROM DishesToIngredients;
DELETE FROM Ingredients;
DELETE FROM Dishes;

-- Add Dishes with real image URLs and multi-line descriptions
INSERT INTO Dishes (name, img, description) VALUES (
  'Pizza Margherita',
  './imgs/Pizza_Margherita.jpg',
  'Pizza Margherita is a classic Neapolitan pizza topped with tomato sauce, mozzarella cheese, and fresh basil leaves. It is celebrated for its simplicity and fresh ingredients. A true symbol of Italian culinary tradition.'
);

INSERT INTO Dishes (name, img, description) VALUES (
  'Spaghetti Carbonara',
  './imgs/Spaghetti_Carbonara.jpg',
  'Spaghetti Carbonara is a Roman pasta dish made with eggs, cheese, pancetta, and black pepper. It is creamy and savory, with a rich, comforting flavor. A beloved staple of Italian cuisine.'
);

INSERT INTO Dishes (name, img, description) VALUES (
  'Fiorentina Steak',
  './imgs/Fiorentina_Steak.jpg',
  'Beef Steak is a juicy cut of beef, grilled or pan-seared to perfection. It is often seasoned simply with salt and pepper. Served with sides like potatoes or vegetables, it is a favorite worldwide.'
);
-- Add ingredients
INSERT INTO Ingredients (id, ingredientName, img) VALUES (1, 'Dough', './imgs/Dough.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (2, 'Tomato', './imgs/Tomato.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (3, 'Mozzarella Cheese', './imgs/Mozzarella_Cheese.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (4, 'Olive Oil', './imgs/Olive_Oil.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (5, 'Basil', './imgs/Basil.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (6, 'Chicken', './imgs/Chicken.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (7, 'Curry Powder', './imgs/Curry_Powder.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (8, 'Coconut Milk', './imgs/Coconut_Milk.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (9, 'Onion', './imgs/Onion.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (10, 'Garlic', './imgs/Garlic.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (11, 'Spaghetti', './imgs/Spaghetti.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (12, 'Eggs', './imgs/Eggs.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (13, 'Bacon', './imgs/Bacon.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (14, 'Parmesan Cheese', './imgs/Parmesan_Cheese.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (15, 'Black Pepper', './imgs/Black_Pepper.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (16, 'Beef', './imgs/Beef.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (17, 'Salt', './imgs/Salt.jpg');
INSERT INTO Ingredients (id, ingredientName, img) VALUES (18, 'Butter', './imgs/Butter.jpg');

-- Associate ingredients with Pizza Margherita
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Pizza Margherita', 1);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Pizza Margherita', 2);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Pizza Margherita', 3);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Pizza Margherita', 4);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Pizza Margherita', 5);

-- Associate ingredients with Spaghetti Carbonara
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Spaghetti Carbonara', 11);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Spaghetti Carbonara', 12);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Spaghetti Carbonara', 13);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Spaghetti Carbonara', 14);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Spaghetti Carbonara', 15);

-- Associate ingredients with Fiorentina Steak
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Fiorentina Steak', 16);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Fiorentina Steak', 17);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Fiorentina Steak', 15);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Fiorentina Steak', 18);
INSERT INTO DishesToIngredients (dishName, ingredientID) VALUES ('Fiorentina Steak', 10);

-- Add feedback data for different nationalities
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Pizza Margherita', 'Italy', 98, 2);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Pizza Margherita', 'USA', 85, 15);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Pizza Margherita', 'Japan', 70, 30);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Pizza Margherita', 'India', 65, 35);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Pizza Margherita', 'France', 80, 20);

INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Spaghetti Carbonara', 'Italy', 95, 5);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Spaghetti Carbonara', 'USA', 80, 20);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Spaghetti Carbonara', 'Japan', 60, 40);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Spaghetti Carbonara', 'India', 50, 50);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Spaghetti Carbonara', 'France', 85, 15);

INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Fiorentina Steak', 'Italy', 75, 25);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Fiorentina Steak', 'USA', 90, 10);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Fiorentina Steak', 'Japan', 70, 30);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Fiorentina Steak', 'India', 30, 70);
INSERT INTO Feedbacks (dishName, nationality, like, dislike) VALUES ('Fiorentina Steak', 'France', 80, 20);


