package com.algoboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AlgoBoardApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlgoBoardApplication.class, args);
	}

}
