package java_libs;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Reflection {

	/**
	 * Get class constructor from class name
	 * 
	 * @param className
	 * @param paramTypes
	 * 		The class array of parameter type of desired constructor
	 * @return
	 * @throws ClassNotFoundException
	 * @throws SecurityException 
	 * @throws NoSuchMethodException 
	 */
	public Constructor getConstructorFromClassName(String className, Class<?>... paramTypes) throws ClassNotFoundException, NoSuchMethodException, SecurityException {
		return Class.forName(className).getConstructor(paramTypes);
	}
	
	
	/**
	 * 
	 * @param ctruct
	 * 		The class constructor
	 * @param args
	 * 		The arguments passed in when constructing object
	 * @return
	 * 		The instance of specified class
	 * @throws InstantiationException
	 * @throws IllegalAccessException
	 * @throws IllegalArgumentException
	 * @throws InvocationTargetException
	 */
	public static Object newObj(Constructor ctruct, Object[] args) throws InstantiationException, IllegalAccessException, IllegalArgumentException, InvocationTargetException {
		
		Object testObj = null;
		
		ctruct.setAccessible(true);
		
		testObj = ctruct.newInstance(args);
		
		return testObj;
	}
	
	/**
	 * 
	 * @param cls
	 * @param name
	 * 		the name of the method
	 * @param paramTypes
	 * 		The class array of parameter type
	 * @return
	 * 		The method
	 * @throws NoSuchMethodException
	 * @throws SecurityException
	 */
	public static Method getPrivateMethod(Class cls, String name, Class<?>... paramTypes) throws NoSuchMethodException, SecurityException {
		
		Method method = cls.getDeclaredMethod(name, paramTypes);
		
		method.setAccessible(true);
		
		return method;
	}
	
	/**
	 * 
	 * @param cls
	 * @param name
	 * 		The field name
	 * @return
	 * 		The private field
	 * @throws SecurityException 
	 * @throws NoSuchFieldException 
	 */
	public static Field getPrivateField(Class cls, String name) throws NoSuchFieldException, SecurityException {
		
		Field field = field = cls.getDeclaredField(name);
		
		field.setAccessible(true);		
		
		return field;
	}
}
