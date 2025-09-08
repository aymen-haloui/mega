import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { phone: '+1234567890' },
    update: {},
    create: {
      name: 'Admin User',
      phone: '+1234567890',
      role: Role.ADMIN,
      password: adminPassword,
      createdBy: 'system'
    }
  });

  console.log('✅ Admin user created:', admin.name);

  // Create sample branches
  const branch1 = await prisma.branch.upsert({
    where: { address: '123 Main St, New York, NY 10001' },
    update: {},
    create: {
      name: 'Downtown Branch',
      address: '123 Main St, New York, NY 10001',
      lat: 40.7128,
      lng: -74.0060,
      createdBy: admin.id
    }
  });

  const branch2 = await prisma.branch.upsert({
    where: { address: '456 Broadway, New York, NY 10013' },
    update: {},
    create: {
      name: 'Broadway Branch',
      address: '456 Broadway, New York, NY 10013',
      lat: 40.7589,
      lng: -73.9851,
      createdBy: admin.id
    }
  });

  console.log('✅ Branches created');

  // Create branch users
  const branchUserPassword = await hashPassword('password123');
  
  const branchUser1 = await prisma.user.upsert({
    where: { phone: '+1987654321' },
    update: {},
    create: {
      name: 'John Manager',
      phone: '+1987654321',
      role: Role.BRANCH_USER,
      branchId: branch1.id,
      password: branchUserPassword,
      createdBy: admin.id
    }
  });

  const branchUser2 = await prisma.user.upsert({
    where: { phone: '+1555123456' },
    update: {},
    create: {
      name: 'Jane Manager',
      phone: '+1555123456',
      role: Role.BRANCH_USER,
      branchId: branch2.id,
      password: branchUserPassword,
      createdBy: admin.id
    }
  });

  console.log('✅ Branch users created');

  // Create ingredients
  const ingredients = [
    'Tomato', 'Onion', 'Garlic', 'Cheese', 'Pepperoni', 'Mushrooms',
    'Bell Peppers', 'Olives', 'Basil', 'Oregano', 'Salt', 'Pepper',
    'Flour', 'Yeast', 'Olive Oil', 'Mozzarella', 'Parmesan', 'Sausage',
    'Chicken', 'Beef', 'Lettuce', 'Cucumber', 'Carrots', 'Spinach'
  ];

  const createdIngredients = [];
  for (const ingredientName of ingredients) {
    const ingredient = await prisma.ingredient.upsert({
      where: { name: ingredientName },
      update: {},
      create: {
        name: ingredientName,
        createdBy: admin.id
      }
    });
    createdIngredients.push(ingredient);
  }

  console.log('✅ Ingredients created');

  // Create menus for each branch
  const menu1 = await prisma.menu.create({
    data: {
      name: 'Main Menu',
      branchId: branch1.id,
      createdBy: admin.id
    }
  });

  const menu2 = await prisma.menu.create({
    data: {
      name: 'Main Menu',
      branchId: branch2.id,
      createdBy: admin.id
    }
  });

  console.log('✅ Menus created');

  // Create sample dishes
  const dishes = [
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      priceCents: 1299,
      menuId: menu1.id,
      ingredients: ['Tomato', 'Mozzarella', 'Basil', 'Flour', 'Yeast', 'Olive Oil']
    },
    {
      name: 'Pepperoni Pizza',
      description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
      priceCents: 1499,
      menuId: menu1.id,
      ingredients: ['Tomato', 'Mozzarella', 'Pepperoni', 'Flour', 'Yeast', 'Olive Oil']
    },
    {
      name: 'Supreme Pizza',
      description: 'Loaded pizza with pepperoni, sausage, mushrooms, bell peppers, and olives',
      priceCents: 1799,
      menuId: menu1.id,
      ingredients: ['Tomato', 'Mozzarella', 'Pepperoni', 'Sausage', 'Mushrooms', 'Bell Peppers', 'Olives', 'Flour', 'Yeast', 'Olive Oil']
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
      priceCents: 899,
      menuId: menu1.id,
      ingredients: ['Lettuce', 'Parmesan', 'Olive Oil', 'Garlic', 'Salt', 'Pepper']
    },
    {
      name: 'Chicken Wings',
      description: 'Crispy chicken wings with your choice of sauce',
      priceCents: 1199,
      menuId: menu1.id,
      ingredients: ['Chicken', 'Salt', 'Pepper', 'Olive Oil']
    }
  ];

  for (const dishData of dishes) {
    const dish = await prisma.dish.create({
      data: {
        name: dishData.name,
        description: dishData.description,
        priceCents: dishData.priceCents,
        menuId: dishData.menuId,
        createdBy: admin.id,
        ingredients: {
          create: dishData.ingredients.map(ingredientName => {
            const ingredient = createdIngredients.find(ing => ing.name === ingredientName);
            return {
              ingredientId: ingredient!.id,
              required: true
            };
          })
        }
      }
    });

    // Set ingredient availability for branch 1
    for (const ingredientName of dishData.ingredients) {
      const ingredient = createdIngredients.find(ing => ing.name === ingredientName);
      await prisma.branchIngredientAvailability.upsert({
        where: {
          branchId_ingredientId: {
            branchId: branch1.id,
            ingredientId: ingredient!.id
          }
        },
        update: {},
        create: {
          branchId: branch1.id,
          ingredientId: ingredient!.id,
          available: true,
          updatedBy: admin.id
        }
      });
    }
  }

  // Create similar dishes for branch 2
  for (const dishData of dishes) {
    const dish = await prisma.dish.create({
      data: {
        name: dishData.name,
        description: dishData.description,
        priceCents: dishData.priceCents,
        menuId: menu2.id,
        createdBy: admin.id,
        ingredients: {
          create: dishData.ingredients.map(ingredientName => {
            const ingredient = createdIngredients.find(ing => ing.name === ingredientName);
            return {
              ingredientId: ingredient!.id,
              required: true
            };
          })
        }
      }
    });

    // Set ingredient availability for branch 2
    for (const ingredientName of dishData.ingredients) {
      const ingredient = createdIngredients.find(ing => ing.name === ingredientName);
      await prisma.branchIngredientAvailability.upsert({
        where: {
          branchId_ingredientId: {
            branchId: branch2.id,
            ingredientId: ingredient!.id
          }
        },
        update: {},
        create: {
          branchId: branch2.id,
          ingredientId: ingredient!.id,
          available: true,
          updatedBy: admin.id
        }
      });
    }
  }

  console.log('✅ Dishes created');

  // Create some sample orders
  const sampleOrders = [
    {
      branchId: branch1.id,
      userName: 'Alice Johnson',
      userPhone: '+1555000001',
      items: [
        { dishName: 'Margherita Pizza', qty: 1 },
        { dishName: 'Caesar Salad', qty: 1 }
      ]
    },
    {
      branchId: branch1.id,
      userName: 'Bob Smith',
      userPhone: '+1555000002',
      items: [
        { dishName: 'Pepperoni Pizza', qty: 2 },
        { dishName: 'Chicken Wings', qty: 1 }
      ]
    },
    {
      branchId: branch2.id,
      userName: 'Carol Davis',
      userPhone: '+1555000003',
      items: [
        { dishName: 'Supreme Pizza', qty: 1 }
      ]
    }
  ];

  for (const orderData of sampleOrders) {
    // Get dishes for this branch
    const branchMenu = await prisma.menu.findFirst({
      where: { branchId: orderData.branchId }
    });

    const dishes = await prisma.dish.findMany({
      where: { menuId: branchMenu!.id }
    });

    const orderItems = [];
    let totalCents = 0;

    for (const item of orderData.items) {
      const dish = dishes.find(d => d.name === item.dishName);
      if (dish) {
        orderItems.push({
          dishId: dish.id,
          qty: item.qty,
          priceCents: dish.priceCents
        });
        totalCents += dish.priceCents * item.qty;
      }
    }

    if (orderItems.length > 0) {
      await prisma.order.create({
        data: {
          orderNumber: Math.floor(100000 + Math.random() * 900000),
          branchId: orderData.branchId,
          userName: orderData.userName,
          userPhone: orderData.userPhone,
          totalCents,
          status: 'COMPLETED',
          createdBy: admin.id,
          items: {
            create: orderItems
          }
        }
      });
    }
  }

  console.log('✅ Sample orders created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Default credentials:');
  console.log('Admin: +1234567890 / admin123');
  console.log('Branch User 1: +1987654321 / password123');
  console.log('Branch User 2: +1555123456 / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
